import os
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.lead import Lead
from app.models.property import Property
from app.models.user import User
from app.models.user_interaction import UserInteraction
from app.services.lead_scoring_service import LeadScoringService

def generate_synthetic_data():
    db = SessionLocal()
    try:
        # Get existing users and properties
        users = db.query(User).filter(User.role == 'user').all()
        properties = db.query(Property).all()

        if not users or not properties:
            print("Not enough users or properties to generate leads.")
            return

        print(f"Generating synthetic leads and interactions...")
        
        actions = ['view', 'click', 'lead', 'visit']

        for _ in range(50):
            user = random.choice(users)
            prop = random.choice(properties)
            
            # Update user budget for variety
            if not user.budget:
                user.budget = prop.price * random.uniform(0.8, 1.2)
                db.add(user)

            # Create lead
            lead = Lead(
                user_id=user.id,
                property_id=prop.id,
                name=user.name,
                email=user.email,
                phone=user.phone,
                message="Synthetic lead for testing",
                converted=random.random() < 0.3 # 30% conversion rate
            )
            db.add(lead)
            db.flush()

            # Create random interactions for this user/property
            num_interactions = random.randint(5, 20)
            for i in range(num_interactions):
                interaction = UserInteraction(
                    user_id=user.id,
                    property_id=prop.id,
                    action=random.choices(actions, weights=[0.6, 0.3, 0.05, 0.05])[0],
                    timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                )
                db.add(interaction)

        db.commit()
        print("Data generated. Training model...")
        
        success = LeadScoringService.train_model(db)
        if success:
            print("Model trained successfully!")
        else:
            print("Model training failed.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    generate_synthetic_data()
