from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PropertyBase(BaseModel):
    title: str
    description: str
    price: float
    location: str
    bedrooms: int = 0
    bathrooms: int = 0
    area: float = 0.0
    status: str = "Available"
    image_url: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    status: Optional[str] = None
    image_url: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    builder_id: int
    admin_status: str = "pending"
    created_at: datetime

    class Config:
        from_attributes = True
