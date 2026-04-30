from app.db.database import SessionLocal
from app.models.user import User
from app.models.property import Property
from app.models.lead import Lead
from app.models.purchase import Purchase
from app.models.user_interaction import UserInteraction

db = SessionLocal()
try:
    print("\n--- BROKERS ---")
    brokers = db.query(User).filter(User.role == "builder").all()
    for b in brokers:
        print(f"Name: {b.name:20} | Rank: {b.broker_rank:10} | Score: {b.broker_score}")

    print("\n--- SAMPLE PROPERTIES ---")
    props = db.query(Property).limit(10).all()
    for p in props:
        print(f"Title: {p.title:25} | Score: {p.property_score:5} | Category: {p.property_category}")

finally:
    db.close()
