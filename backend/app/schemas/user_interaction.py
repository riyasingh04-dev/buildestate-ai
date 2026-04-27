#These are Pydantic models (used for request/response validation)
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class UserInteractionBase(BaseModel):
    property_id: int
    action: str  # view, click, lead
    session_id: Optional[str] = None # For anonymous users

class UserInteractionCreate(UserInteractionBase):
    pass

class UserInteractionResponse(UserInteractionBase):
    id: int
    user_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    recommendations: List[Dict]
