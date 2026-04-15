from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.lead import Lead
from app.models.property import Property
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadResponse
from app.core.security import get_current_user

router = APIRouter()

# CREATE LEAD (User Only)
@router.post("/", response_model=LeadResponse)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if property exists
    db_property = db.query(Property).filter(Property.id == lead_in.property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    new_lead = Lead(
        user_id=current_user.id,
        property_id=lead_in.property_id,
        message=lead_in.message
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead

# VIEW LEADS (Builder Only)
@router.get("/", response_model=List[LeadResponse])
def get_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG: Fetching leads for Builder ID: {current_user.id} ({current_user.email})")
    
    if current_user.role != "builder":
        raise HTTPException(status_code=403, detail="Only builders can view leads")
    
    # Get all properties owned by this builder
    property_ids = [p.id for p in db.query(Property).filter(Property.builder_id == current_user.id).all()]
    
    # Get all leads for these properties
    leads = db.query(Lead).filter(Lead.property_id.in_(property_ids)).all() if property_ids else []
    
    print(f"DEBUG: Found {len(leads)} leads for this builder.")
    return leads

# VIEW MY OWN INTERESTS (User Only)
@router.get("/my", response_model=List[LeadResponse])
def get_my_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all leads created by THIS user
    leads = db.query(Lead).filter(Lead.user_id == current_user.id).all()
    return leads

# CHECK IF INTERESTED
@router.get("/check/{property_id}")
def check_interest(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(
        Lead.property_id == property_id,
        Lead.user_id == current_user.id
    ).first()
    
    return {"is_interested": lead is not None}
