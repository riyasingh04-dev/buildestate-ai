from sqlalchemy import Column, Integer, String, ForeignKey, DateTime #Importing SQLAlchemy column types:Integer, String → data typesForeignKey → relationship between tables,DateTime → timestamp storage
from sqlalchemy.orm import relationship#Used to define relationships between tables (ORM mapping)
from datetime import datetime #Used to store timestamp
from app.db.database import Base #Used to define the base class for all models

class UserInteraction(Base):#creating a table model for user interactions
    __tablename__ = "user_interactions"#table name

    id = Column(Integer, primary_key=True, index=True)#primary key
    user_id = Column(Integer, ForeignKey("users.id"))#foreign key to user table
    property_id = Column(Integer, ForeignKey("properties.id"))#foreign key to property table
    action = Column(String)  # view, click, lead (Important for ml weightings)
    timestamp = Column(DateTime, default=datetime.utcnow)#default timestamp

    user = relationship("User")#relationship to user table
    property = relationship("Property")#relationship to property table
