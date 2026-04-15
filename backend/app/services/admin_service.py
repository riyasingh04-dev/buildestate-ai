from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.models.user import User
from app.models.property import Property
from app.models.lead import Lead
from fastapi import HTTPException
from datetime import datetime, timedelta

class AdminService:
    @staticmethod
    def get_all_users(db: Session):
        return db.query(User).all()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int, admin_id: int):
        if user_id == admin_id:
            raise HTTPException(status_code=400, detail="Admin cannot delete themselves")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}

    @staticmethod
    def toggle_user_block(db: Session, user_id: int, is_blocked: bool):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_blocked = is_blocked
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_all_builders(db: Session):
        return db.query(User).filter(User.role == "builder").all()

    @staticmethod
    def verify_builder(db: Session, builder_id: int):
        builder = db.query(User).filter(User.id == builder_id, User.role == "builder").first()
        if not builder:
            raise HTTPException(status_code=404, detail="Builder not found")
        builder.is_verified = True
        db.commit()
        db.refresh(builder)
        return builder

    @staticmethod
    def get_all_properties_admin(db: Session):
        return db.query(Property).all()

    @staticmethod
    def update_property_admin_status(db: Session, prop_id: int, status: str):
        if status not in ["pending", "approved", "rejected"]:
            raise HTTPException(status_code=400, detail="Invalid admin status")
        prop = db.query(Property).filter(Property.id == prop_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        prop.admin_status = status
        db.commit()
        db.refresh(prop)
        return prop

    @staticmethod
    def delete_property_admin(db: Session, prop_id: int):
        prop = db.query(Property).filter(Property.id == prop_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        db.delete(prop)
        db.commit()
        return {"message": "Property removed by admin"}

    @staticmethod
    def get_platform_stats(db: Session):
        total_users = db.query(User).count()
        total_builders = db.query(User).filter(User.role == "builder").count()
        total_buyers = db.query(User).filter(User.role == "user").count()
        total_properties = db.query(Property).count()
        total_leads = db.query(Lead).count()

        # Property moderation status breakdown
        approved = db.query(Property).filter(Property.admin_status == "approved").count()
        pending = db.query(Property).filter(Property.admin_status == "pending").count()
        rejected = db.query(Property).filter(Property.admin_status == "rejected").count()

        # --- Real Daily Activity: last 14 days ---
        today = datetime.utcnow().date()
        days_range = [today - timedelta(days=i) for i in range(13, -1, -1)]  # oldest → newest

        # Group leads by day
        leads_by_day_rows = (
            db.query(cast(Lead.created_at, Date).label("day"), func.count().label("count"))
            .group_by(cast(Lead.created_at, Date))
            .all()
        )
        leads_by_day = {row.day: row.count for row in leads_by_day_rows}

        # Group properties by day
        props_by_day_rows = (
            db.query(cast(Property.created_at, Date).label("day"), func.count().label("count"))
            .group_by(cast(Property.created_at, Date))
            .all()
        )
        props_by_day = {row.day: row.count for row in props_by_day_rows}

        # Build unified timeline
        activity_trend = []
        for day in days_range:
            activity_trend.append({
                "date": day.strftime("%d %b"),
                "leads": leads_by_day.get(day, 0),
                "properties": props_by_day.get(day, 0),
            })

        return {
            "total_users": total_users,
            "total_builders": total_builders,
            "total_buyers": total_buyers,
            "total_properties": total_properties,
            "total_leads": total_leads,
            "property_status_breakdown": [
                {"name": "Approved", "value": approved},
                {"name": "Pending", "value": pending},
                {"name": "Rejected", "value": rejected},
            ],
            "user_role_breakdown": [
                {"name": "Buyers", "value": total_buyers},
                {"name": "Builders", "value": total_builders},
            ],
            "activity_trend": activity_trend,
        }
