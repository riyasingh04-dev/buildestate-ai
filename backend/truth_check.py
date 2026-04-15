from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run():
    with engine.connect() as conn:
        print("\n=== THE TRUTH ABOUT LEADS ===")
        
        # 1. Total Leads Count
        count = conn.execute(text("SELECT COUNT(*) FROM leads")).scalar()
        print(f"Total Leads in Database: {count}")
        
        # 2. Detailed Leads
        if count > 0:
            leads = conn.execute(text("""
                SELECT l.id, u_buyer.name as buyer, p.title as property, u_builder.email as builder
                FROM leads l
                JOIN users u_buyer ON l.user_id = u_buyer.id
                JOIN properties p ON l.property_id = p.id
                JOIN users u_builder ON p.builder_id = u_builder.id
            """)).fetchall()
            for l in leads:
                print(f"Lead ID {l.id} | Buyer: {l.buyer} | Property: {l.property} | Intended For: {l.builder}")
        else:
            print("The leads table is COMPLETELY EMPTY.")
            
        # 3. Last 5 Users who registered
        users = conn.execute(text("SELECT name, email, role FROM users ORDER BY id DESC LIMIT 5")).fetchall()
        print("\nLast 5 registered users:")
        for u in users:
            print(f" - {u.name} ({u.email}) as {u.role}")

run()
