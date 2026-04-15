from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run():
    with engine.connect() as conn:
        print("\n=== SYSTEM OWNERSHIP DIAGNOSTIC ===")
        
        # 1. Check Property 1 specifically (the one in user screenshot)
        p1 = conn.execute(text("SELECT p.id, p.title, u.email as builder_email FROM properties p JOIN users u ON p.builder_id = u.id WHERE p.id = 1")).fetchone()
        if p1:
            print(f"Property ID: 1 ({p1.title}) is owned by: {p1.builder_email}")
        else:
            print("Property ID 1 not found.")
            
        # 2. Check Leads for Property 1
        leads = conn.execute(text("SELECT l.id, u.name as buyer_name, u.email as buyer_email FROM leads l JOIN users u ON l.user_id = u.id WHERE l.property_id = 1")).fetchall()
        print(f"\nTotal Leads for Property 1: {len(leads)}")
        for l in leads:
            print(f" - Buyer: {l.buyer_name} ({l.buyer_email})")
            
        # 3. List all builders
        builders = conn.execute(text("SELECT name, email FROM users WHERE role = 'builder'")).fetchall()
        print("\nAll Registered Builders:")
        for b in builders:
            print(f" - {b.name} ({b.email})")

run()
