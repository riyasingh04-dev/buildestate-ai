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

def refresh_all_scores():
    leads = db.query(Lead).all()
    print(f"Refreshing scores for {len(leads)} leads...")
    updated_count = 0
    for lead in leads:
        try:
            result = LeadScoringService.predict_score(db, lead.id)
            if result:
                lead.lead_score = result["conversion_probability"]
                lead.lead_category = result["lead_category"]
                updated_count += 1
                print(f"  Lead {lead.id}: {lead.lead_category} ({lead.lead_score:.4f})")
        except Exception as e:
            print(f"  Error for Lead {lead.id}: {e}")
    
    db.commit()
    print(f"Successfully updated {updated_count} leads.")

if __name__ == "__main__":
    refresh_all_scores()
