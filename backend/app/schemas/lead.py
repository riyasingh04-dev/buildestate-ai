from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class PropertySummary(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True

class LeadCreate(BaseModel):
    property_id: int
    message: Optional[str] = None

class LeadResponse(BaseModel):
    id: int
    user_id: int
    property_id: int
    message: Optional[str]
    created_at: datetime
    user: UserSummary
    property: PropertySummary

    class Config:
        from_attributes = True
