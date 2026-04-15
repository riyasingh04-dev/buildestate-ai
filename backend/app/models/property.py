from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    location = Column(String, index=True)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    area = Column(Float, default=0.0)
    status = Column(String, default="Available")
    admin_status = Column(String, default="pending")  # pending / approved / rejected
    image_url = Column(String, nullable=True)
    builder_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    builder = relationship("User", back_populates="properties")
    leads = relationship("Lead", back_populates="property", cascade="all, delete-orphan")
