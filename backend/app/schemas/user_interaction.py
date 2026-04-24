#These are Pydantic models (used for request/response validation)
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class UserInteractionBase(BaseModel):#Base model for user interaction
    property_id: int #input fields for frontend to send data to backend
    action: str  # view, click, lead

class UserInteractionCreate(UserInteractionBase):#Creating a schema for user interaction to validate data coming from frontend to backend
    pass#Used for POST request,Inherits base fields

class UserInteractionResponse(UserInteractionBase):#Creating a schema for user interaction response,sending data from backend to frontend(Used for API response)
    id: int
    user_id: int
    timestamp: datetime

    class Config:#Config class used for ORM mapping(Converts SQLAlchemy model → Pydantic response)
        from_attributes = True

class RecommendationResponse(BaseModel):#Creating a schema for recommendation response
    user_id: int
    recommendations: List[Dict]#list of dictionaries containing recommended properties
