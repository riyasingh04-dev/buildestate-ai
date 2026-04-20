import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath("d:/BuildEstate_AI/backend"))

from app.db.database import SessionLocal
# Import all models to ensure they are registered in the registry
from app.models.user import User
from app.models.property import Property
from app.models.lead import Lead

db = SessionLocal()
try:
    total = db.query(Property).count()
    with_embeddings = db.query(Property).filter(Property.embedding_data != None).count()
    print(f"Total properties: {total}")
    print(f"Properties with embeddings: {with_embeddings}")
    
    if total > 0:
        sample = db.query(Property).first()
        print(f"Sample property: {sample.title}")
        print(f"Embedding data snippet: {str(sample.embedding_data)[:100]}...")
finally:
    db.close()
