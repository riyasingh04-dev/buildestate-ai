from sqlalchemy import create_engine, text
from app.db.database import DATABASE_URL

engine = create_engine(DATABASE_URL)

def check_db():
    with engine.connect() as conn:
        print("--- USERS ---")
        users = conn.execute(text("SELECT id, name, email, role FROM users")).fetchall()
        for u in users:
            print(u)
            
        print("\n--- PROPERTIES ---")
        props = conn.execute(text("SELECT id, title, admin_status FROM properties")).fetchall()
        for p in props:
            print(p)

if __name__ == "__main__":
    check_db()
