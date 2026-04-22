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
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class LeadResponse(BaseModel):
    id: int
    property_id: int
    user_id: Optional[int]
    message: Optional[str]
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    user: Optional[UserSummary] = None
    property: PropertySummary

    class Config:
        from_attributes = True
