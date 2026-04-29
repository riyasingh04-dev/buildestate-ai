from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class InteractionSummary(BaseModel):
    id: int
    action: str
    timestamp: datetime
    property_title: Optional[str] = None

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
    converted: bool = False
    lead_score: Optional[float] = None
    lead_category: Optional[str] = None
    created_at: datetime
    user: Optional[UserSummary] = None
    property: PropertySummary

    class Config:
        from_attributes = True

class LeadScoreResponse(BaseModel):
    conversion_probability: float
    lead_category: str
    explanation: Optional[str] = None
    contributions: Optional[dict] = None

class LeadDetailResponse(BaseModel):
    lead: LeadResponse
    score_details: LeadScoreResponse
    interactions: List[InteractionSummary]

    class Config:
        from_attributes = True
