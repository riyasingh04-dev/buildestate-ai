from app.db.database import SessionLocal
from app.db import base # This imports all models into the registry
from app.models.user import User
from app.models.property import Property
from app.core.security import hash_password

def setup():
    db = SessionLocal()
    try:
        # 1. Create Default Admin
        admin_email = "admin@buildestate.com"
        admin_pass = "Admin@123"
        
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            new_admin = User(
                name="Platform Admin",
                email=admin_email,
                password=hash_password(admin_pass),
                role="admin"
            )
            db.add(new_admin)
            print(f"Created New Admin: {admin_email} / {admin_pass}")
        else:
            existing_admin.role = "admin"
            print(f"User {admin_email} is already an Admin.")

        # 2. Approve all current properties so they are visible
        pending_props = db.query(Property).filter(Property.admin_status == "pending").all()
        for prop in pending_props:
            prop.admin_status = "approved"
        
        db.commit()
        print(f"Approved {len(pending_props)} properties. They are now visible to users.")

    finally:
        db.close()

if __name__ == "__main__":
    setup()
