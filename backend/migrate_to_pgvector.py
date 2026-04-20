import os
import json
import psycopg2
from dotenv import load_dotenv
from app.db.database import SessionLocal, engine
from app.models.user import User
from app.models.property import Property
from app.models.lead import Lead
from app.utils.embeddings import get_embedding, format_property_for_embedding
from sqlalchemy import text

load_dotenv()

def migrate():
    # 1. Enable pgvector extension and add column
    print("Enabling pgvector extension and adding column...")
    db_url = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    try:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("Extension 'vector' ensured.")
        
        # Check if column exists
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='properties' AND column_name='embedding';")
        if not cur.fetchone():
            cur.execute("ALTER TABLE properties ADD COLUMN embedding vector(384);")
            print("Column 'embedding' added to 'properties' table.")
        else:
            print("Column 'embedding' already exists.")
            
    except Exception as e:
        print(f"Error during SQL setup: {e}")
    finally:
        cur.close()
        conn.close()

    # 2. Migrate data
    print("Migrating data...")
    db = SessionLocal()
    properties = db.query(Property).all()
    
    updated_count = 0
    for p in properties:
        # Check if we can use existing JSON data
        embedding_list = None
        if p.embedding_data:
            try:
                embedding_list = json.loads(p.embedding_data)
                # Verify dimension
                if len(embedding_list) != 384:
                    print(f"Property {p.id}: Dimension mismatch ({len(embedding_list)} != 384). Regenerating...")
                    embedding_list = None
            except:
                print(f"Property {p.id}: Failed to load JSON embedding. Regenerating...")
                embedding_list = None
        
        # If no valid embedding, generate one
        if not embedding_list:
            text_to_embed = format_property_for_embedding(p.title, p.description, p.amenities)
            embedding_list = get_embedding(text_to_embed)
            # Save the JSON version too for consistency if needed
            p.embedding_data = json.dumps(embedding_list)
        
        if embedding_list:
            p.embedding = embedding_list
            updated_count += 1
            if updated_count % 10 == 0:
                print(f"Processed {updated_count} properties...")
    
    db.commit()
    db.close()
    print(f"Successfully migrated {updated_count} properties.")

if __name__ == "__main__":
    migrate()
