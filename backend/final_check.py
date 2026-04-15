from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run():
    with engine.connect() as conn:
        print("\n=== SYSTEM SYNC DIAGNOSTIC ===")
        
        # 1. Builder Info
        builder = conn.execute(text("SELECT id, name, email FROM users WHERE email = 'globalbuilder@buildestate.com'")).fetchone()
        if builder:
            print(f"Logged Builder: {builder.name} | ID: {builder.id} | Email: {builder.email}")
        else:
            print("ERROR: Global builder email not found in DB.")

        # 2. Property Ownership
        props = conn.execute(text("SELECT id, title, builder_id FROM properties LIMIT 5")).fetchall()
        print("\n[Property Ownership Sample]")
        for p in props:
            print(f"Property ID: {p.id} | Title: {p.title} | Owner ID: {p.builder_id}")

        # 3. All Leads
        leads = conn.execute(text("SELECT l.id, l.user_id, l.property_id, p.builder_id as p_owner FROM leads l JOIN properties p ON l.property_id = p.id")).fetchall()
        print(f"\n[All Leads Table: {len(leads)} total]")
        for l in leads:
            print(f"Lead ID {l.id} | Created by User {l.user_id} | For Prop {l.property_id} | Owned by Builder {l.p_owner}")

        if builder and any(l.p_owner == builder.id for l in leads):
            print("\nSTATUS: Leads DO exist for this builder in the DB.")
        else:
            print("\nSTATUS: No leads found in DB for this specific builder.")

        print("\n=== END DIAGNOSTIC ===")

run()
