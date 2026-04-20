import json
from app.db.database import SessionLocal
from app.models import property, user, lead, builder # Import all models to register them
from app.models.property import Property
from app.utils.embeddings import get_embedding, format_property_for_embedding

# Sample amenities for variety
AMENITIES_SAMPLES = [
    "Swimming Pool, Gym, Parking",
    "Security, Garden, Power Backup",
    "CCTV, Lift, Gym",
    "Clubhouse, Parking, Garden",
    "Swimming Pool, Security, Parking"
]

def recompute_all():
    db = SessionLocal()
    properties = db.query(Property).all()
    
    print(f"Found {len(properties)} properties. Updating...")
    
    for i, p in enumerate(properties):
        # Assign some amenities if none exist
        if not p.amenities:
            p.amenities = AMENITIES_SAMPLES[i % len(AMENITIES_SAMPLES)]
        
        # Format text for embedding
        text_to_embed = format_property_for_embedding(p.title, p.description, p.amenities)
        
        # Generate embedding
        embedding = get_embedding(text_to_embed)
        p.embedding_data = json.dumps(embedding)
        
        print(f"Updated: {p.title}")
    
    db.commit()
    db.close()
    print("All properties updated with amenities and embeddings!")

if __name__ == "__main__":
    recompute_all()
