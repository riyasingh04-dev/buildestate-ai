"""
migrate_new_columns.py
──────────────────────
Adds the two new columns introduced in the vector-first refactor:
  • pinecone_synced  BOOLEAN  NOT NULL DEFAULT FALSE
  • updated_at       TIMESTAMP  DEFAULT NOW()

Run once after pulling this update:
    python migrate_new_columns.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from app.db.database import engine

MIGRATIONS = [
    # Add pinecone_synced column (idempotent — won't error if already exists)
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='properties' AND column_name='pinecone_synced'
        ) THEN
            ALTER TABLE properties
            ADD COLUMN pinecone_synced BOOLEAN NOT NULL DEFAULT FALSE;
        END IF;
    END $$;
    """,

    # Add updated_at column
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='properties' AND column_name='updated_at'
        ) THEN
            ALTER TABLE properties
            ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        END IF;
    END $$;
    """,

    # Backfill updated_at for rows where it's NULL
    """
    UPDATE properties
    SET updated_at = created_at
    WHERE updated_at IS NULL;
    """,
]


def run():
    print("Running migrations…")
    with engine.connect() as conn:
        for sql in MIGRATIONS:
            conn.execute(text(sql))
        conn.commit()
    print("[OK] Migrations complete.")
    print("   -> Run:  python sync_to_pinecone.py  to bulk-index existing properties.")


if __name__ == "__main__":
    run()
