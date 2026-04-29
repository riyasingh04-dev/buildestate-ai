from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.lead import Lead
from app.models.user import User
from app.models.user_interaction import UserInteraction
import os

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db" # Default for local dev? I should check database.py
if os.path.exists("realestate.db"):
    SQLALCHEMY_DATABASE_URL = "sqlite:///./realestate.db"
# Wait, I should check app/db/database.py to be sure about the URL.
