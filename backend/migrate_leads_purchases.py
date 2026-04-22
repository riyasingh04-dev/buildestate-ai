import os
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from app.db.database import engine

MIGRATIONS = [
    # Update Leads table for anonymous fields
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='name') THEN
            ALTER TABLE leads ADD COLUMN name VARCHAR;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='email') THEN
            ALTER TABLE leads ADD COLUMN email VARCHAR;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='phone') THEN
            ALTER TABLE leads ADD COLUMN phone VARCHAR;
        END IF;
        ALTER TABLE leads ALTER COLUMN user_id DROP NOT NULL;
    END $$;
    """,

    # Create Purchases table
    """
    CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        property_id INTEGER REFERENCES properties(id) NOT NULL,
        amount FLOAT NOT NULL,
        status VARCHAR DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
    );
    """
]

def run():
    print("Running Lead/Purchase migrations…")
    with engine.connect() as conn:
        for sql in MIGRATIONS:
            conn.execute(text(sql))
        conn.commit()
    print("[OK] Migrations complete.")

if __name__ == "__main__":
    run()
