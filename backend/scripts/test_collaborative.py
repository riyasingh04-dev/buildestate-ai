import os
import sys

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
# Import all models to ensure they are registered
from app.models.user import User
from app.models.property import Property
from app.models.user_interaction import UserInteraction
from app.models.lead import Lead
from app.models.purchase import Purchase
from app.services.collaborative_service import CollaborativeService

def test_collaborative():
    db = SessionLocal()
    try:
        # Pick a user who has history (we know test users 1-50 have history)
        user_id = 9 # Ritika or a test user
        print(f"Testing Collaborative Recommendations for User {user_id}...")
        
        recs = CollaborativeService.get_collaborative_recommendations(db, user_id, top_n=5)
        
        print(f"Got {len(recs)} recommendations:")
        for r in recs:
            print(f" - ID: {r['property_id']} | Score: {r['score']} | Title: {r['metadata']['title']}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_collaborative()
