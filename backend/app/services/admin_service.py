from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.models.user import User
from app.models.property import Property
from app.models.lead import Lead
from app.models.user_interaction import UserInteraction
from app.models.purchase import Purchase
from app.services.lead_scoring_service import LeadScoringService
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
        from app.models.purchase import Purchase
        total_users = db.query(User).count()
        total_builders = db.query(User).filter(User.role == "builder").count()
        total_buyers = db.query(User).filter(User.role == "user").count()
        total_properties = db.query(Property).count()
        total_leads = db.query(Lead).count()
        
        # Sales stats
        total_sales = db.query(func.sum(Purchase.amount)).scalar() or 0
        sold_properties = db.query(Property).filter(Property.is_sold == True).count()

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
        
        # Group purchases by day
        purchases_by_day_rows = (
            db.query(cast(Purchase.created_at, Date).label("day"), func.count().label("count"))
            .group_by(cast(Purchase.created_at, Date))
            .all()
        )
        purchases_by_day = {row.day: row.count for row in purchases_by_day_rows}

        # Build unified timeline
        activity_trend = []
        for day in days_range:
            activity_trend.append({
                "date": day.strftime("%d %b"),
                "leads": leads_by_day.get(day, 0),
                "properties": props_by_day.get(day, 0),
                "sales": purchases_by_day.get(day, 0),
            })

        # Lead Scoring Stats
        hot_leads = db.query(Lead).filter(Lead.lead_category == "Hot").count()
        warm_leads = db.query(Lead).filter(Lead.lead_category == "Warm").count()
        cold_leads = db.query(Lead).filter(Lead.lead_category == "Cold").count()
        converted_leads = db.query(Lead).filter(Lead.converted == True).count()
        conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
        avg_score = db.query(func.avg(Lead.lead_score)).scalar() or 0

        return {
            "total_users": total_users,
            "total_builders": total_builders,
            "total_buyers": total_buyers,
            "total_properties": total_properties,
            "total_leads": total_leads,
            "total_revenue": total_sales,
            "sold_count": sold_properties,
            "conversion_rate": round(conversion_rate, 2),
            "avg_lead_score": round(float(avg_score), 4),
            "property_status_breakdown": [
                {"name": "Approved", "value": max(0, approved - sold_properties)},
                {"name": "Pending", "value": pending},
                {"name": "Rejected", "value": rejected},
                {"name": "Sold", "value": sold_properties},
            ],
            "user_role_breakdown": [
                {"name": "Buyers", "value": total_buyers},
                {"name": "Builders", "value": total_builders},
            ],
            "lead_category_breakdown": [
                {"name": "Hot", "value": hot_leads},
                {"name": "Warm", "value": warm_leads},
                {"name": "Cold", "value": cold_leads},
            ],
            "activity_trend": activity_trend,
        }

    @staticmethod
    def get_all_leads_admin(db: Session):
        return db.query(Lead).all()

    @staticmethod
    def get_lead_details(db: Session, lead_id: int):
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        # Get AI Score Insights
        score_details = LeadScoringService.predict_score(db, lead_id)

        # Get Interaction Timeline
        interactions = []
        if lead.user_id:
            interactions = (
                db.query(UserInteraction)
                .filter(UserInteraction.user_id == lead.user_id)
                .order_by(UserInteraction.timestamp.desc())
                .all()
            )
        
        # Format interactions for response
        formatted_interactions = []
        for inter in interactions:
            formatted_interactions.append({
                "id": inter.id,
                "action": inter.action,
                "timestamp": inter.timestamp,
                "property_title": inter.property.title if inter.property else None
            })

        return {
            "lead": lead,
            "score_details": score_details,
            "interactions": formatted_interactions
        }

    @staticmethod
    def convert_lead_to_buyer(db: Session, lead_id: int):
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        if lead.converted:
            return {"message": "Lead already converted", "lead": lead}

        prop = db.query(Property).filter(Property.id == lead.property_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Associated property not found")

        # 1. Mark lead as converted
        lead.converted = True
        
        # 2. Mark property as sold
        prop.is_sold = True

        # 3. Create purchase record if user exists
        if lead.user_id:
            purchase = Purchase(
                user_id=lead.user_id,
                property_id=prop.id,
                amount=prop.price or 0,
                status="completed"
            )
            db.add(purchase)

        db.commit()
        db.refresh(lead)
        return {"message": "Lead successfully converted to buyer", "lead": lead}
