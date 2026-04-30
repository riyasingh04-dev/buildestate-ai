import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    print("Adding new columns to properties table...")
    try:
        cursor.execute("ALTER TABLE properties ADD COLUMN property_score FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE properties ADD COLUMN property_category TEXT")
        print("Success: Property columns added.")
    except Exception as e:
        conn.rollback()
        print(f"Note: {e}")
    else:
        conn.commit()

    print("Adding new columns to users table...")
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN broker_rank TEXT")
        cursor.execute("ALTER TABLE users ADD COLUMN broker_score FLOAT DEFAULT 0.0")
        print("Success: User columns added.")
    except Exception as e:
        conn.rollback()
        print(f"Note: {e}")
    else:
        conn.commit()

    cursor.close()
    conn.close()
    print("Migration complete.")
except Exception as e:
    print(f"Error connecting to database: {e}")
