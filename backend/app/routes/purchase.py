from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.purchase import Purchase
from app.models.property import Property
from app.models.user import User
from app.schemas.purchase import PurchaseCreate, PurchaseResponse
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=PurchaseResponse)
def create_purchase(
    purchase_in: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if property exists
    prop = db.query(Property).filter(Property.id == purchase_in.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    # Check if already sold
    if prop.is_sold:
        raise HTTPException(status_code=400, detail="Property already sold")

    # Mock payment processing
    new_purchase = Purchase(
        user_id=current_user.id,
        property_id=purchase_in.property_id,
        amount=purchase_in.amount,
        status="completed"
    )
    
    # Mark property as sold
    prop.is_sold = True
    prop.status = "Sold"
    
    db.add(new_purchase)
    db.commit()
    db.refresh(new_purchase)
    return new_purchase

@router.get("/me", response_model=List[PurchaseResponse])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Purchase).filter(Purchase.user_id == current_user.id).all()

@router.get("/check/{property_id}")
def check_purchase(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    purchase = db.query(Purchase).filter(
        Purchase.user_id == current_user.id,
        Purchase.property_id == property_id
    ).first()
    
    return {"is_purchased": purchase is not None}
