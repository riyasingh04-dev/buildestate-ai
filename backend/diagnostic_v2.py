from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run():
    with engine.connect() as conn:
        print("\n=== SYSTEM OWNERSHIP DIAGNOSTIC ===")
        
        # 1. Properties and their owners
        print("\n[Properties & Owners]")
        props = conn.execute(text("SELECT p.id, p.title, u.name as builder_name, u.email as builder_email FROM properties p JOIN users u ON p.builder_id = u.id")).fetchall()
        for p in props:
            print(f"Property ID: {p.id} | Title: {p.title} | Owned by: {p.builder_name} ({p.builder_email})")
            
        # 2. Leads and what property/builder they belong to
        print("\n[Leads Discovery]")
        leads = conn.execute(text("""
            SELECT l.id, u_buyer.name as buyer_name, p.title as property_title, u_builder.name as builder_name, u_builder.email as builder_email
            FROM leads l
            JOIN users u_buyer ON l.user_id = u_buyer.id
            JOIN properties p ON l.property_id = p.id
            JOIN users u_builder ON p.builder_id = u_builder.id
        """)).fetchall()
        
        if not leads:
            print("No leads found in database.")
        else:
            for l in leads:
                print(f"Lead ID: {l.id} | Buyer: {l.buyer_name} | For: {l.property_title} | Intended For Builder: {l.builder_name} ({l.builder_email})")
        
        # 3. All Builders (for the user to check their email)
        print("\n[Available Builders]")
        builders = conn.execute(text("SELECT id, name, email FROM users WHERE role = 'builder'")).fetchall()
        for b in builders:
            print(f"Builder ID: {b.id} | Name: {b.name} | Email: {b.email}")
            
        print("\n=== END DIAGNOSTIC ===")

if __name__ == "__main__":
    run()
