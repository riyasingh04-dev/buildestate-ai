from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from app.core.security import get_current_user

router = APIRouter()

# CREATE PROPERTY (Builder Only)
@router.post("/", response_model=PropertyResponse)
def create_property(
    property_in: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "builder":
        raise HTTPException(status_code=403, detail="Only builders can list properties")
    
    new_property = Property(
        **property_in.model_dump(),
        builder_id=current_user.id
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property

# GET ALL PROPERTIES (Public)
@router.get("/", response_model=List[PropertyResponse])
def get_properties(
    db: Session = Depends(get_db),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None
):
    query = db.query(Property).filter(Property.admin_status == "approved")
    if min_price:
        query = query.filter(Property.price >= min_price)
    if max_price:
        query = query.filter(Property.price <= max_price)
    if location:
        query = query.filter(Property.location.ilike(f"%{location}%"))
    
    return query.all()

# GET MY PROPERTIES (Builder Only)
@router.get("/me", response_model=List[PropertyResponse])
def get_my_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "builder":
        raise HTTPException(status_code=403, detail="Only builders can view their properties here")
    
    properties = db.query(Property).filter(Property.builder_id == current_user.id).all()
    return properties

# GET SINGLE PROPERTY
@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property

# UPDATE PROPERTY (Owner Only)
@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_in: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if db_property.builder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this property")
    
    update_data = property_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_property, field, value)
    
    db.commit()
    db.refresh(db_property)
    return db_property

# DELETE PROPERTY (Owner Only)
@router.delete("/{property_id}")
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_property = db.query(Property).filter(Property.id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if db_property.builder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this property")
    
    db.delete(db_property)
    db.commit()
    return {"message": "Property deleted successfully"}
