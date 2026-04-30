from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse, PropertyPaginationResponse
from app.core.security import get_current_user
from app.models.purchase import Purchase
from app.routes.lead import get_optional_user
from fastapi.responses import Response
from app.services.pinecone_sync import sync_property_to_pinecone, remove_property_from_pinecone
from app.services.property_scoring_service import PropertyScoringService

router = APIRouter()

# ---------------- CREATE PROPERTY ----------------
@router.post("/", response_model=PropertyResponse)
def create_property(
    property_in: PropertyCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "builder":
        raise HTTPException(status_code=403, detail="Only builders can list properties")

    new_property = Property(
        **property_in.model_dump(),
        builder_id=current_user.id,
        pinecone_synced=False,
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)

    background_tasks.add_task(sync_property_to_pinecone, new_property, db)

    return new_property


# ---------------- GET ALL PROPERTIES ----------------
@router.get("/", response_model=PropertyPaginationResponse)
def get_properties(
    db: Session = Depends(get_db),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    builder_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 12,
):
    query = db.query(Property).filter(Property.admin_status == "approved")

    if min_price:
        query = query.filter(Property.price >= min_price)
    if max_price:
        query = query.filter(Property.price <= max_price)
    if location:
        query = query.filter(Property.location.ilike(f"%{location}%"))
    if builder_id:
        query = query.filter(Property.builder_id == builder_id)

    total = query.count()
    properties = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "properties": properties,
        "skip": skip,
        "limit": limit
    }


# ---------------- GET MY PROPERTIES ----------------
@router.get("/me", response_model=List[PropertyResponse])
def get_my_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "builder":
        raise HTTPException(status_code=403, detail="Only builders can view their properties here")

    return db.query(Property).filter(Property.builder_id == current_user.id).all()


# ---------------- 🚀 TRAIN MODEL ----------------
@router.get("/train-model")
def train_model(db: Session = Depends(get_db)):
    result = PropertyScoringService.train_and_compare_models(db)

    if not result:
        return {"message": "Not enough data to train model"}

    return {"message": "Model training completed successfully"}


# ---------------- GET SINGLE PROPERTY ----------------
@router.get("/{property_id:int}", response_model=PropertyResponse)
def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    is_purchased = False
    if current_user:
        purchase = db.query(Purchase).filter(
            Purchase.user_id == current_user.id,
            Purchase.property_id == property_id
        ).first()
        is_purchased = purchase is not None

    is_owner = current_user and prop.builder_id == current_user.id
    is_admin = current_user and current_user.role == "admin"

    if not (is_purchased or is_owner or is_admin):
        prop.bedrooms = 0
        prop.bathrooms = 0
        prop.area = 0.0
        prop.amenities = "Purchase to view amenities"
        setattr(prop, "is_purchased", False)
    else:
        setattr(prop, "is_purchased", True)

    return prop


# ---------------- PROPERTY REPORT ----------------
@router.get("/{property_id:int}/report")
def get_property_report(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.property_id == property_id
    ).first()

    if not purchase:
        raise HTTPException(status_code=403, detail="You must purchase this property")

    prop = db.query(Property).filter(Property.id == property_id).first()

    report_content = f"""
    BUILD ESTATE AI - PROPERTY REPORT
    ---------------------------------
    Title: {prop.title}
    Location: {prop.location}
    Price: ${prop.price:,.2f}

    Bedrooms: {prop.bedrooms}
    Bathrooms: {prop.bathrooms}
    Area: {prop.area} sqft
    Amenities: {prop.amenities}

    Purchased on: {purchase.created_at.strftime('%Y-%m-%d')}
    """

    return Response(
        content=report_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=property_{property_id}.txt"}
    )


# ---------------- UPDATE PROPERTY ----------------
@router.put("/{property_id:int}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_in: PropertyUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prop = db.query(Property).filter(Property.id == property_id).first()

    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if prop.builder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = property_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prop, field, value)

    prop.pinecone_synced = False
    db.commit()
    db.refresh(prop)

    background_tasks.add_task(sync_property_to_pinecone, prop, db)

    return prop


# ---------------- DELETE PROPERTY ----------------
@router.delete("/{property_id:int}")
def delete_property(
    property_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prop = db.query(Property).filter(Property.id == property_id).first()

    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if prop.builder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    background_tasks.add_task(remove_property_from_pinecone, property_id)

    db.delete(prop)
    db.commit()

    return {"message": "Property deleted successfully"}