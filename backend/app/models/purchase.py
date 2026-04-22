from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="completed")  # completed, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="purchases")
    property = relationship("Property", backref="purchases")
