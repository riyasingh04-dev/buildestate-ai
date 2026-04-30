import sys
import os
from sqlalchemy import text

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine

def migrate():
    with engine.connect() as conn:
        print("Migrating users table for password reset...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP"))
            conn.commit()
            print("Successfully added reset_token and reset_token_expires columns.")
        except Exception as e:
            print(f"Error migrating users table: {e}")

if __name__ == "__main__":
    migrate()
