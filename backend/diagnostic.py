from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("--- DIAGNOSTIC REPORT ---")
    
    # Check Users
    print("\n[Users]")
    users = conn.execute(text("SELECT id, name, email, role FROM users")).fetchall()
    for u in users:
        print(f"ID: {u.id} | Name: {u.name} | Email: {u.email} | Role: {u.role}")

    # Check Properties
    print("\n[Properties]")
    props = conn.execute(text("SELECT id, title, builder_id FROM properties")).fetchall()
    for p in props:
        print(f"ID: {p.id} | Title: {p.title} | Builder ID: {p.builder_id}")

    # Check Leads
    print("\n[Leads]")
    leads = conn.execute(text("SELECT id, user_id, property_id FROM leads")).fetchall()
    for l in leads:
        print(f"ID: {l.id} | User ID: {l.user_id} | Property ID: {l.property_id}")

    print("\n--- END REPORT ---")
