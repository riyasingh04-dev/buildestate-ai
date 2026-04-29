import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate():
    if not DATABASE_URL:
        print("DATABASE_URL not found in .env")
        return

    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Add columns to leads table
        print("Adding columns to leads table...")
        try:
            cursor.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE")
            cursor.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score FLOAT")
            cursor.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_category TEXT")
            print("Success: leads table updated.")
        except Exception as e:
            print(f"Error updating leads table: {e}")
            conn.rollback()

        # Add column to users table
        print("Adding budget column to users table...")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS budget FLOAT")
            print("Success: users table updated.")
        except Exception as e:
            print(f"Error updating users table: {e}")
            conn.rollback()

        conn.commit()
        cursor.close()
        conn.close()
        print("Migration complete.")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    migrate()
