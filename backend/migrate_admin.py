from sqlalchemy import text
from app.db.database import engine

def migrate():
    with engine.connect() as conn:
        print("Starting migration...")
        
        # Add is_blocked to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Added is_blocked column to users table")
        except Exception as e:
            print(f"is_blocked column might already exist: {e}")

        # Add is_verified to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Added is_verified column to users table")
        except Exception as e:
            print(f"is_verified column might already exist: {e}")

        # Add admin_status to properties
        try:
            conn.execute(text("ALTER TABLE properties ADD COLUMN admin_status VARCHAR DEFAULT 'pending'"))
            conn.commit()
            print("Added admin_status column to properties table")
            
            # Update existing properties to approved
            conn.execute(text("UPDATE properties SET admin_status = 'approved' WHERE admin_status IS NULL"))
            conn.commit()
            print("Updated existing properties to 'approved'")
        except Exception as e:
            print(f"admin_status column might already exist: {e}")

        print("Migration completed.")

if __name__ == "__main__":
    migrate()
