from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.property import Property
from app.models.lead import Lead 
from app.models.purchase import Purchase
from app.models.user_interaction import UserInteraction
from app.services.property_scoring_service import PropertyScoringService
from app.services.broker_service import BrokerService
import random

# Ensure tables exist (though we already migrated)
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        print("Cleaning up old seed data (optional)...")
        # For safety, let's just add new ones or update
        
        # 1. Create Brokers
        broker_data = [
            {"name": "Elite Realty", "email": "elite@example.com", "rank": "Elite"},
            {"name": "Good Homes", "email": "good@example.com", "rank": "Good"},
            {"name": "Budget Stay", "email": "budget@example.com", "rank": "Average"}
        ]

        brokers = []
        for b in broker_data:
            user = db.query(User).filter(User.email == b["email"]).first()
            if not user:
                user = User(
                    name=b["name"],
                    email=b["email"],
                    password="password123", # Should be hashed in real app
                    role="builder",
                    is_verified=True
                )
                db.add(user)
                db.flush()
            brokers.append(user)

        # 2. Create Properties for Elite Broker (Scores >= 9)
        # Features: Large area (3000+), High amenities
        for i in range(3):
            prop = Property(
                title=f"Luxury Villa {i+1}",
                description="A magnificent luxury villa with premium finishings.",
                price=15000000 + random.randint(0, 5000000),
                location="Highland Park",
                area=3500 + random.randint(0, 500),
                bedrooms=5,
                bathrooms=4,
                amenities="Pool, Wifi, Gym, Parking, Security, Garden",
                admin_status="approved",
                builder_id=brokers[0].id
            )
            db.add(prop)

        # 3. Create Properties for Good Broker (Scores 7-8)
        for i in range(3):
            prop = Property(
                title=f"Comfort Apartment {i+1}",
                description="Spacious apartment in a good neighborhood.",
                price=8000000 + random.randint(0, 2000000),
                location="Green Valley",
                area=1800 + random.randint(0, 300),
                bedrooms=3,
                bathrooms=2,
                amenities="Wifi, Parking, Security",
                admin_status="approved",
                builder_id=brokers[1].id
            )
            db.add(prop)

        # 4. Create Properties for Average Broker (Scores < 7)
        for i in range(3):
            prop = Property(
                title=f"Budget Studio {i+1}",
                description="Small but functional studio apartment.",
                price=3000000 + random.randint(0, 1000000),
                location="Downtown Side",
                area=600 + random.randint(0, 200),
                bedrooms=1,
                bathrooms=1,
                amenities="Parking",
                admin_status="approved",
                builder_id=brokers[2].id
            )
            db.add(prop)

        db.commit()
        print("Properties seeded.")

        # 5. Run Scoring
        print("Calculating property scores...")
        PropertyScoringService.update_all_scores(db)
        
        print("Calculating broker ranks...")
        BrokerService.update_broker_ranks(db)

        print("Seeding complete! Check the database for rankings.")

    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
