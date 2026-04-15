from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run():
    with engine.connect() as conn:
        print("\n=== SYSTEM SYNC CHECK ===")
        
        # 1. Global Builder Check
        builder = conn.execute(text("SELECT id, name, email FROM users WHERE email = 'globalbuilder@buildestate.com'")).fetchone()
        if not builder:
            print("ERROR: Global Builder account not found!")
            return
        print(f"Global Builder: ID {builder.id} | Email: {builder.email}")
        
        # 2. Property Check for this Builder
        props = conn.execute(text(f"SELECT id, title FROM properties WHERE builder_id = {builder.id}")).fetchall()
        print(f"\nProperties owned by ID {builder.id}: {len(props)}")
        prop_ids = []
        for p in props:
            print(f" - Property ID {p.id}: {p.title}")
            prop_ids.append(p.id)
            
        # 3. Lead Check
        if prop_ids:
            ids_str = ",".join(map(str, prop_ids))
            leads = conn.execute(text(f"SELECT l.id, u.name as buyer, l.property_id FROM leads l JOIN users u ON l.user_id = u.id WHERE l.property_id IN ({ids_str})")).fetchall()
            print(f"\nLeads for these properties: {len(leads)}")
            for l in leads:
                print(f" - Lead ID {l.id} | Buyer: {l.buyer} | For Property ID: {l.property_id}")
        else:
            print("\nCritical: This Builder has NO properties in the database.")

        # 4. Orphans check (Leads for non-existent properties or shifted IDs)
        orphans = conn.execute(text("SELECT l.id, l.property_id FROM leads l LEFT JOIN properties p ON l.property_id = p.id WHERE p.id IS NULL")).fetchall()
        if orphans:
            print(f"\nFound {len(orphans)} orphan leads (Property ID no longer exists):")
            for o in orphans:
                print(f" - Lead ID {o.id} for missing Property ID {o.property_id}")

        print("\n=== END CHECK ===")

run()
