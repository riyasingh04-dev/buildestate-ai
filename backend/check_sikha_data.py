from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.lead import Lead
from app.models.user_interaction import UserInteraction
from app.models.property import Property # Added to fix registry
from app.models.purchase import Purchase # Added for completeness
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def check_user_data(email):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User {email} not found")
        return

    print(f"User: {user.name} (ID: {user.id})")
    
    leads = db.query(Lead).filter(Lead.user_id == user.id).all()
    print(f"Leads: {len(leads)}")
    for l in leads:
        print(f"  Lead ID: {l.id}, Score: {l.lead_score}, Category: {l.lead_category}")
        
    interactions = db.query(UserInteraction).filter(UserInteraction.user_id == user.id).all()
    print(f"Interactions: {len(interactions)}")
    for i in interactions:
        print(f"  Action: {i.action}, Property ID: {i.property_id}, Timestamp: {i.timestamp}")

if __name__ == "__main__":
    users = db.query(User).filter(User.name.ilike("%Sikha%")).all()
    if not users:
        print("No user found with 'Sikha' in name")
    for u in users:
        check_user_data(u.email)
