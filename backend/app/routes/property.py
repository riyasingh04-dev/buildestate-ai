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

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# CREATE PROPERTY  (Builder only)
# ─────────────────────────────────────────────────────────────────────────────
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

    # Real-time sync in background — doesn't block the HTTP response
    background_tasks.add_task(sync_property_to_pinecone, new_property, db)

    return new_property


# ─────────────────────────────────────────────────────────────────────────────
# GET ALL PROPERTIES  (Public)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/", response_model=PropertyPaginationResponse)
def get_properties(
    db: Session = Depends(get_db),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
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
        
    total = query.count()
    properties = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "properties": properties,
        "skip": skip,
        "limit": limit
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET MY PROPERTIES  (Builder only)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/me", response_model=List[PropertyResponse])
def get_my_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "builder":
        raise HTTPException(status_code=403, detail="Only builders can view their properties here")
    return db.query(Property).filter(Property.builder_id == current_user.id).all()


# ─────────────────────────────────────────────────────────────────────────────
# GET SINGLE PROPERTY
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if this user has purchased the property
    is_purchased = False
    if current_user:
        purchase = db.query(Purchase).filter(
            Purchase.user_id == current_user.id,
            Purchase.property_id == property_id
        ).first()
        is_purchased = purchase is not None

    # Mask detailed info if not purchased
    # (Except for builders viewing their own or admins)
    is_owner = current_user and prop.builder_id == current_user.id
    is_admin = current_user and current_user.role == "admin"

    if not (is_purchased or is_owner or is_admin):
        # Create a copy or modify the object for the response (Pydantic will handle the rest)
        # We'll return the object but with sensitive fields cleared
        prop.bedrooms = 0
        prop.bathrooms = 0
        prop.area = 0.0
        prop.amenities = "Purchase to view amenities"
        # We can also add a flag to the schema later
        setattr(prop, "is_purchased", False)
    else:
        setattr(prop, "is_purchased", True)

    return prop

# ─────────────────────────────────────────────────────────────────────────────
# DOWNLOAD PROPERTY REPORT
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/{property_id}/report")
def get_property_report(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify purchase
    purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.property_id == property_id
    ).first()
    
    if not purchase:
        raise HTTPException(status_code=403, detail="You must purchase this property to download the report")

    prop = db.query(Property).filter(Property.id == property_id).first()
    
    # Generate a simple text-based report
    report_content = f"""
    BUILD ESTATE AI - PROPERTY REPORT
    ---------------------------------
    Title: {prop.title}
    Location: {prop.location}
    Price: ${prop.price:,.2f}
    
    DETAILED SPECIFICATIONS:
    Bedrooms: {prop.bedrooms}
    Bathrooms: {prop.bathrooms}
    Area: {prop.area} sqft
    Amenities: {prop.amenities}
    
    Status: {prop.status}
    Purchased on: {purchase.created_at.strftime('%Y-%m-%d')}
    ---------------------------------
    Thank you for your purchase!
    """
    
    return Response(
        content=report_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=property_report_{property_id}.txt"}
    )


# ─────────────────────────────────────────────────────────────────────────────
# UPDATE PROPERTY  (Owner only)
# ─────────────────────────────────────────────────────────────────────────────
@router.put("/{property_id}", response_model=PropertyResponse)
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
        raise HTTPException(status_code=403, detail="Not authorized to update this property")

    update_data = property_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prop, field, value)

    # Mark as unsynced so the scheduler picks it up even if background task fails
    prop.pinecone_synced = False
    db.commit()
    db.refresh(prop)

    # Real-time re-sync in background
    background_tasks.add_task(sync_property_to_pinecone, prop, db)

    return prop


# ─────────────────────────────────────────────────────────────────────────────
# DELETE PROPERTY  (Owner only)
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/{property_id}")
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
        raise HTTPException(status_code=403, detail="Not authorized to delete this property")

    # Remove from Pinecone BEFORE deleting from DB (so we still have the ID)
    background_tasks.add_task(remove_property_from_pinecone, property_id)

    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}
