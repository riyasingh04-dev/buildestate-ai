from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print("Adding amenities column...")
        try:
            conn.execute(text("ALTER TABLE properties ADD COLUMN amenities TEXT"))
            conn.commit()
            print("Successfully added amenities.")
        except Exception as e:
            print(f"Amenities column might already exist: {e}")
        
        print("Adding embedding_data column...")
        try:
            conn.execute(text("ALTER TABLE properties ADD COLUMN embedding_data TEXT"))
            conn.commit()
            print("Successfully added embedding_data.")
        except Exception as e:
            print(f"Embedding_data column might already exist: {e}")

if __name__ == "__main__":
    migrate()
