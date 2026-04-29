from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.lead import Lead
from app.models.user import User
from app.models.user_interaction import UserInteraction
from app.models.property import Property
from app.models.purchase import Purchase
from app.services.lead_scoring_service import LeadScoringService
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def inspect_sikha_leads():
    user = db.query(User).filter(User.name.ilike("%Sikha%")).first()
    if not user:
        print("Sikha not found")
        return
    
    leads = db.query(Lead).filter(Lead.user_id == user.id).all()
    for lead in leads:
        features = LeadScoringService.calculate_features(db, lead.id)
        print(f"Lead {lead.id} Features: {features}")
        score_details = LeadScoringService.predict_score(db, lead.id)
        print(f"  Score: {score_details['conversion_probability']}, Category: {score_details['lead_category']}")

if __name__ == "__main__":
    inspect_sikha_leads()
