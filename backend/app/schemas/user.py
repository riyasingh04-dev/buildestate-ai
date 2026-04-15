from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    is_blocked: bool = False
    is_verified: bool = False

    class Config:
        from_attributes = True