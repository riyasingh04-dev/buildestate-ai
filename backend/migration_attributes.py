from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        print("Checking and adding columns to properties table...")
        # Add bedrooms
        conn.execute(text("ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0"))
        # Add bathrooms
        conn.execute(text("ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0"))
        # Add area
        conn.execute(text("ALTER TABLE properties ADD COLUMN IF NOT EXISTS area FLOAT DEFAULT 0.0"))
        # Add status
        conn.execute(text("ALTER TABLE properties ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'Available'"))
        
        conn.commit()
        print("Migration complete: Added bedrooms, bathrooms, area, and status columns.")

if __name__ == "__main__":
    run_migration()
