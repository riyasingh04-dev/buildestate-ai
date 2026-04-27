from sqlalchemy import Column, Integer, String, ForeignKey, DateTime #Importing SQLAlchemy column types:Integer, String → data typesForeignKey → relationship between tables,DateTime → timestamp storage
from sqlalchemy.orm import relationship#Used to define relationships between tables (ORM mapping)
from datetime import datetime #Used to store timestamp
from app.db.database import Base #Used to define the base class for all models

class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional user ID
    session_id = Column(String, index=True, nullable=True) # Anonymous session ID
    property_id = Column(Integer, ForeignKey("properties.id"))
    action = Column(String)  # view, click, lead
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    property = relationship("Property")
