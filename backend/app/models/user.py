from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
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
    budget = Column(Float, nullable=True)
    broker_rank = Column(String, nullable=True)    # Elite / Good / Average
    broker_score = Column(Float, default=0.0)
    
    # Password Reset
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    properties = relationship("Property", back_populates="builder", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="user", cascade="all, delete-orphan")