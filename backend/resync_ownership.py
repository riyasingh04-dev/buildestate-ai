from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Tom&jerry04@localhost:5432/realestate"
engine = create_engine(DATABASE_URL)

def run():
    with engine.connect() as conn:
        print("Finding Global Builder...")
        builder = conn.execute(text("SELECT id FROM users WHERE email = 'globalbuilder@buildestate.com'")).fetchone()
        
        if builder:
            builder_id = builder.id
            print(f"Global Builder found with ID: {builder_id}")
            
            # Re-assign all properties to this builder
            result = conn.execute(text(f"UPDATE properties SET builder_id = {builder_id}"))
            conn.commit()
            print(f"Success! {result.rowcount} properties re-assigned to Global Builder.")
        else:
            print("Error: Global Builder not found.")

if __name__ == "__main__":
    run()
