from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Property(Base):
    __tablename__ = "properties"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String, index=True)
    description  = Column(String)
    price        = Column(Float)
    location     = Column(String, index=True)
    bedrooms     = Column(Integer, default=0)
    bathrooms    = Column(Integer, default=0)
    area         = Column(Float, default=0.0)
    status       = Column(String, default="Available")
    admin_status = Column(String, default="pending")   # pending / approved / rejected
    image_url    = Column(String, nullable=True)
    amenities    = Column(String, nullable=True)        # Comma-separated list
    is_sold      = Column(Boolean, default=False, nullable=False)
    embedding_data = Column(String, nullable=True)      # JSON-encoded 384-dim vector

    # ── Sync tracking ──────────────────────────────────────────────────────
    pinecone_synced = Column(Boolean, default=False, nullable=False)
    """True when this property's current data is reflected in Pinecone."""

    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    """Auto-updated on every ORM flush — used by the scheduler for delta sync."""

    builder_id  = Column(Integer, ForeignKey("users.id"))
    builder     = relationship("User", back_populates="properties")
    leads       = relationship("Lead", back_populates="property", cascade="all, delete-orphan")
