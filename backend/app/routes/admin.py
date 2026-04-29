from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.schemas.user import UserOut
from app.schemas.property import PropertyResponse
from app.schemas.lead import LeadResponse, LeadDetailResponse
from app.services.admin_service import AdminService

router = APIRouter()

# DASHBOARD STATS
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.get_platform_stats(db)

# USER MANAGEMENT
@router.get("/users", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.get_all_users(db)

@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.get_user_by_id(db, user_id)

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.delete_user(db, user_id, admin.id)

@router.patch("/users/{user_id}/block", response_model=UserOut)
def block_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.toggle_user_block(db, user_id, True)

@router.patch("/users/{user_id}/unblock", response_model=UserOut)
def unblock_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.toggle_user_block(db, user_id, False)

# BUILDER MANAGEMENT
@router.get("/builders", response_model=List[UserOut])
def get_builders(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.get_all_builders(db)

@router.patch("/builders/{builder_id}/verify", response_model=UserOut)
def verify_builder(builder_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.verify_builder(db, builder_id)

# PROPERTY MODERATION
@router.get("/properties", response_model=List[PropertyResponse])
def get_properties_admin(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.get_all_properties_admin(db)

@router.patch("/properties/{property_id}/approve", response_model=PropertyResponse)
def approve_property(property_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.update_property_admin_status(db, property_id, "approved")

@router.patch("/properties/{property_id}/reject", response_model=PropertyResponse)
def reject_property(property_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.update_property_admin_status(db, property_id, "rejected")

@router.delete("/properties/{property_id}")
def delete_property_admin(property_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.delete_property_admin(db, property_id)

# LEAD MANAGEMENT
@router.get("/leads", response_model=List[LeadResponse])
def get_leads_admin(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.get_all_leads_admin(db)

@router.get("/leads/{lead_id}/details", response_model=LeadDetailResponse)
def get_lead_details(lead_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.get_lead_details(db, lead_id)

@router.post("/leads/{lead_id}/convert")
def convert_lead(lead_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return AdminService.convert_lead_to_buyer(db, lead_id)
