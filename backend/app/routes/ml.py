from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.services.recommendation_service import RecommendationService
from app.services.collaborative_service import CollaborativeService
from app.schemas.user_interaction import UserInteractionCreate, UserInteractionResponse, RecommendationResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter() #Create route group

@router.post("/interact", response_model=UserInteractionResponse)
async def track_interaction(
    interaction_in: UserInteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)#Authenticated user
):
    """
    Track user interaction (view, click, lead) with a property.
    """
    return await RecommendationService.track_interaction(
        db=db,
        user_id=current_user.id,
        property_id=interaction_in.property_id,
        action=interaction_in.action
    )

@router.get("/recommendations/{user_id}", response_model=RecommendationResponse) #Get personalized property recommendations for a user
async def get_recommendations(
    user_id: int,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Get personalized property recommendations for a user.
    """
    recommendations = await RecommendationService.get_recommendations( #Call ML logic from recommendation_service.py
        db=db,
        user_id=user_id,
        location=location,
        min_price=min_price,
        max_price=max_price
    )
    
    return {
        "user_id": user_id,
        "recommendations": recommendations
    }

@router.get("/collaborative/{user_id}", response_model=RecommendationResponse)
async def get_collaborative_recommendations(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get recommendations based on item-based collaborative filtering.
    """
    recommendations = CollaborativeService.get_collaborative_recommendations(
        db=db,
        user_id=user_id,
        top_n=5
    )
    
    return {
        "user_id": user_id,
        "recommendations": recommendations
    }
