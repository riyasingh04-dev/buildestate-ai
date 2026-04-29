import sqlite3
import os

db_path = "sql_app.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add columns to leads table
        print("Adding columns to leads table...")
        cursor.execute("ALTER TABLE leads ADD COLUMN converted BOOLEAN DEFAULT 0")
        cursor.execute("ALTER TABLE leads ADD COLUMN lead_score FLOAT")
        cursor.execute("ALTER TABLE leads ADD COLUMN lead_category TEXT")
        print("Success: leads table updated.")
    except sqlite3.OperationalError as e:
        print(f"Note: {e}")

    try:
        # Add column to users table
        print("Adding budget column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN budget FLOAT")
        print("Success: users table updated.")
    except sqlite3.OperationalError as e:
        print(f"Note: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
