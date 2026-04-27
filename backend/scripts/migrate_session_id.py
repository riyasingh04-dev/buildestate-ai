"""
Migration: Add session_id column to user_interactions and make user_id nullable.
Run once from the backend directory:  python scripts/migrate_session_id.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.database import engine

def run():
    with engine.connect() as conn:
        # Add session_id column (safe to run even if it already exists)
        try:
            conn.execute(text(
                "ALTER TABLE user_interactions ADD COLUMN session_id VARCHAR;"
            ))
            print("[OK] Added 'session_id' column.")
        except Exception as e:
            print(f"[SKIP] session_id column may already exist: {e}")

        # Create index on session_id for fast lookups
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS ix_user_interactions_session_id "
                "ON user_interactions (session_id);"
            ))
            print("[OK] Created index on 'session_id'.")
        except Exception as e:
            print(f"[SKIP] Index creation: {e}")

        # Make user_id nullable (PostgreSQL syntax)
        try:
            conn.execute(text(
                "ALTER TABLE user_interactions ALTER COLUMN user_id DROP NOT NULL;"
            ))
            print("[OK] Made 'user_id' nullable.")
        except Exception as e:
            print(f"[SKIP] user_id nullable change: {e}")

        conn.commit()
        print("[DONE] Migration complete.")

if __name__ == "__main__":
    run()
