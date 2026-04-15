from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(String, nullable=True)
    role = Column(String, default="user")
    is_blocked = Column(Boolean, default=False, server_default="false")
    is_verified = Column(Boolean, default=False, server_default="false")  # for builders

    properties = relationship("Property", back_populates="builder", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="user", cascade="all, delete-orphan")