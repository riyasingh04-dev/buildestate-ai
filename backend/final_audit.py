from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run():
    with engine.connect() as conn:
        print("\n=== SYSTEM AUDIT REPORT ===")
        
        # 1. Builder Info
        builder = conn.execute(text("SELECT id, name, email FROM users WHERE email = 'globalbuilder@buildestate.com'")).fetchone()
        if builder:
            print(f"TARGET BUILDER: {builder.name} | ID: {builder.id} | Email: {builder.email}")
            
            # 2. Properties for this builder
            props = conn.execute(text(f"SELECT id, title FROM properties WHERE builder_id = {builder.id}")).fetchall()
            print(f"\nProperties owned by ID {builder.id}: {len(props)}")
            for p in props:
                # Count leads for this specific property
                l_count = conn.execute(text(f"SELECT COUNT(*) FROM leads WHERE property_id = {p.id}")).scalar()
                print(f" - Prop ID {p.id}: {p.title} | Leads: {l_count}")
        else:
            print("CRITICAL: Global builder account not found.")

        # 3. All Leads in System
        all_leads = conn.execute(text("""
            SELECT l.id, l.property_id, p.title as prop_title, p.builder_id as owner_id 
            FROM leads l 
            JOIN properties p ON l.property_id = p.id
        """)).fetchall()
        print(f"\nTotal System Leads: {len(all_leads)}")
        for l in all_leads:
            print(f" - Lead {l.id} for Prop {l.property_id} ({l.prop_title}) | Owned by Builder ID: {l.owner_id}")

        print("\n=== END REPORT ===")

run()
