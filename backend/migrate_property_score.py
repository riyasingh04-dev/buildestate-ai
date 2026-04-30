import sqlite3
import os

db_path = "sql_app.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Adding new columns to properties table...")
    try:
        cursor.execute("ALTER TABLE properties ADD COLUMN property_score FLOAT DEFAULT 0.0")
        cursor.execute("ALTER TABLE properties ADD COLUMN property_category TEXT")
        print("Success: Property columns added.")
    except sqlite3.OperationalError as e:
        print(f"Note: {e}")

    print("Adding new columns to users table...")
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN broker_rank TEXT")
        cursor.execute("ALTER TABLE users ADD COLUMN broker_score FLOAT DEFAULT 0.0")
        print("Success: User columns added.")
    except sqlite3.OperationalError as e:
        print(f"Note: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")
