import os
import random
import asyncio
import sys

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
# Import all models to ensure they are registered with Base
from app.models.user import User
from app.models.property import Property
from app.models.user_interaction import UserInteraction
from app.models.lead import Lead
from app.models.purchase import Purchase

from app.services.pinecone_sync import sync_property_to_pinecone
from dotenv import load_dotenv

load_dotenv()

# Configuration
NUM_USERS = 50
NUM_PROPERTIES = 200
NUM_INTERACTIONS = 2000

LOCATIONS = ["Delhi", "Mumbai", "Bangalore", "Jaipur", "Gurgaon"]
USER_TYPES = ["budget", "mid", "luxury"]
ACTIONS = ["view", "click", "lead"]
WEIGHTS = [0.6, 0.3, 0.1]

async def seed_data():
    db = SessionLocal()
    try:
        print("Starting Seeding Process...")

        # 1. Create Users
        existing_users = db.query(User).count()
        if existing_users < NUM_USERS:
            print(f"Creating {NUM_USERS - existing_users} new users...")
            for i in range(existing_users + 1, NUM_USERS + 1):
                user = User(
                    name=f"Test User {i}",
                    email=f"testuser{i}@example.com",
                    password="pbkdf2:sha256:260000$...", # Dummy hashed password
                    role="user"
                )
                db.add(user)
            db.commit()
        
        user_ids = [u.id for u in db.query(User).all()]
        print(f"Total Users: {len(user_ids)}")

        # 2. Create Properties
        existing_props = db.query(Property).count()
        if existing_props < NUM_PROPERTIES:
            print(f"Creating {NUM_PROPERTIES - existing_props} new properties...")
            for i in range(existing_props + 1, NUM_PROPERTIES + 1):
                # Assign tier based on ID range
                if i <= 70:
                    tier = "Budget"
                    price = random.randint(20, 50) * 100000 # 20L to 50L
                elif i <= 140:
                    tier = "Mid-Range"
                    price = random.randint(51, 150) * 100000 # 51L to 1.5Cr
                else:
                    tier = "Luxury"
                    price = random.randint(151, 500) * 100000 # 1.5Cr to 5Cr

                prop = Property(
                    title=f"{tier} {random.choice(['Apartment', 'Villa', 'Penthouse'])} in {random.choice(LOCATIONS)}",
                    description=f"Beautiful {tier.lower()} property with modern amenities. Located in a prime area of {random.choice(LOCATIONS)}.",
                    location=random.choice(LOCATIONS),
                    price=price,
                    bedrooms=random.randint(1, 5),
                    bathrooms=random.randint(1, 4),
                    area=random.randint(500, 5000),
                    status="Available",
                    admin_status="approved",
                    builder_id=1 # Assuming admin/builder 1 exists
                )
                db.add(prop)
                db.commit()
                db.refresh(prop)
                
                # Sync to Pinecone immediately
                print(f"   - Syncing property {prop.id} to Pinecone...")
                sync_property_to_pinecone(prop, db)

        prop_ids = [p.id for p in db.query(Property).all()]
        print(f"Total Properties: {len(prop_ids)}")

        # 3. Generate Interactions (Your Logic)
        print(f"Generating {NUM_INTERACTIONS} interactions...")
        
        # Assign preferences to users
        user_prefs = {}
        for uid in user_ids:
            user_prefs[uid] = {
                "type": random.choice(USER_TYPES),
                "location": random.choice(LOCATIONS)
            }

        for i in range(NUM_INTERACTIONS):
            user_id = random.choice(user_ids)
            pref = user_prefs[user_id]

            # Filter properties based on user preference tier
            # We use the modulo or ID range logic similar to how they were created
            if pref["type"] == "budget":
                target_props = [pid for pid in prop_ids if pid <= 70]
            elif pref["type"] == "mid":
                target_props = [pid for pid in prop_ids if 71 <= pid <= 140]
            else:
                target_props = [pid for pid in prop_ids if pid >= 141]

            if not target_props: target_props = prop_ids # Fallback

            property_id = random.choice(target_props)
            action = random.choices(ACTIONS, WEIGHTS)[0]

            interaction = UserInteraction(
                user_id=user_id,
                property_id=property_id,
                action=action
            )
            db.add(interaction)
            if i % 100 == 0:
                print(f"   - Generated {i} interactions...")
        
        db.commit()
        print("Seeding completed successfully!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
