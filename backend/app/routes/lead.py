from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import jwt

from app.db.database import get_db
from app.models.lead import Lead
from app.models.property import Property
from app.models.user import User
from app.models.user_interaction import UserInteraction
from app.schemas.lead import LeadCreate, LeadResponse
from app.core.security import get_current_user, SECRET_KEY, ALGORITHM

router = APIRouter()

def get_optional_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email:
            return db.query(User).filter(User.email == email).first()
    except Exception:
        return None
    return None

# CREATE LEAD (Public)
@router.post("/", response_model=LeadResponse)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # Check if property exists
    db_property = db.query(Property).filter(Property.id == lead_in.property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if db_property.is_sold:
        raise HTTPException(status_code=400, detail="Cannot express interest in a sold property")

    new_lead = Lead(
        property_id=lead_in.property_id,
        message=lead_in.message,
        # If logged in, link to user. Otherwise, use provided fields.
        user_id=current_user.id if current_user else None,
        name=current_user.name if current_user else lead_in.name,
        email=current_user.email if current_user else lead_in.email,
        phone=current_user.phone if current_user else lead_in.phone
    )
    db.add(new_lead)
    
    # ── Track Interaction ──────────────────────────────────────────────────
    if current_user:
        interaction = UserInteraction(
            user_id=current_user.id,
            property_id=new_lead.property_id,
            action="lead"
        )
        db.add(interaction)

    db.commit()
    db.refresh(new_lead)
    return new_lead

# VIEW LEADS (Builder Only)
@router.get("/", response_model=List[LeadResponse])
def get_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "builder":
        raise HTTPException(status_code=403, detail="Only builders can view leads")
    
    # Get all properties owned by this builder
    property_ids = [p.id for p in db.query(Property).filter(Property.builder_id == current_user.id).all()]
    
    # Get all leads for these properties
    leads = db.query(Lead).filter(Lead.property_id.in_(property_ids)).all() if property_ids else []
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
