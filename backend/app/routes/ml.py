from fastapi import APIRouter, Depends, HTTPException, Request, Cookie
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.services.recommendation_service import RecommendationService
from app.services.collaborative_service import CollaborativeService
from app.services.hybrid_service import HybridService
from app.schemas.user_interaction import UserInteractionCreate, UserInteractionResponse, RecommendationResponse
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.models.lead import Lead
from app.services.lead_scoring_service import LeadScoringService
from app.schemas.lead import LeadScoreResponse
from pydantic import BaseModel

router = APIRouter()


# ─── Schemas ──────────────────────────────────────────────────────────────────

class MergeSessionRequest(BaseModel):
    session_id: str


# ─── Interact Endpoint ────────────────────────────────────────────────────────

@router.post("/interact", response_model=UserInteractionResponse)
async def track_interaction(
    interaction_in: UserInteractionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Track a user interaction (view, click, lead) with a property.
    Works for:
      - Logged-in users  → identified by JWT token (user_id).
      - Anonymous users  → identified by session_id in the request body.
    """
    user_id = current_user.id if current_user else None
    session_id = interaction_in.session_id if not current_user else None

    if user_id is None and not session_id:
        raise HTTPException(
            status_code=400,
            detail="Either a valid auth token (logged-in) or a session_id (anonymous) must be provided."
        )

    return await RecommendationService.track_interaction(
        db=db,
        property_id=interaction_in.property_id,
        action=interaction_in.action,
        user_id=user_id,
        session_id=session_id,
    )


# ─── Recommendations Endpoint ─────────────────────────────────────────────────

@router.get("/recommendations")
async def get_recommendations(
    session_id: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    top_k: int = 5,
    alpha: float = 0.7,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Hybrid recommendations for any entity:
    - Logged-in users → use user_id.
    - Anonymous users → use session_id query param.
    Strategy is chosen automatically:
      < 3 interactions → content-based (or trending for brand-new).
      ≥ 3 interactions → hybrid (collaborative + content-based).
    """
    user_id = current_user.id if current_user else None

    if user_id is None and not session_id:
        # Completely unknown visitor – return trending properties
        trending = await RecommendationService.get_cold_start_recommendations(db, top_k)
        for rec in trending:
            rec["source"] = "trending"
        return {
            "strategy": "trending",
            "user_id": None,
            "session_id": None,
            "recommendations": trending,
        }

    result = await HybridService.get_hybrid_recommendations(
        db=db,
        top_k=top_k,
        user_id=user_id,
        session_id=session_id,
        location=location,
        min_price=min_price,
        max_price=max_price,
        alpha=alpha,
    )

    return {
        "strategy": result.get("strategy"),
        "user_id": user_id,
        "session_id": session_id,
        "interaction_count": result.get("interaction_count"),
        "alpha": result.get("alpha"),
        "recommendations": result.get("recommendations", []),
    }


# ─── Collaborative Endpoint (legacy / debug) ──────────────────────────────────

@router.get("/collaborative")
async def get_collaborative_recommendations(
    session_id: Optional[str] = None,
    top_n: int = 5,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Pure item-based collaborative filtering (for debugging / comparison).
    Supports both logged-in users and anonymous sessions.
    """
    user_id = current_user.id if current_user else None

    if user_id is None and not session_id:
        raise HTTPException(status_code=400, detail="Provide a valid token or session_id.")

    recommendations = CollaborativeService.get_collaborative_recommendations(
        db=db,
        top_n=top_n,
        user_id=user_id,
        session_id=session_id,
    )

    return {
        "user_id": user_id,
        "session_id": session_id,
        "recommendations": recommendations,
    }


# ─── Session Merge Endpoint ───────────────────────────────────────────────────

@router.post("/merge-session")
async def merge_session(
    payload: MergeSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # Must be logged in
):
    """
    Called right after login to migrate anonymous session interactions to the user's account.
    Frontend should call this once with the stored session_id immediately after a successful login.
    """
    if not payload.session_id:
        raise HTTPException(status_code=400, detail="session_id is required.")

    merged_count = HybridService.merge_session_to_user(
        db=db,
        session_id=payload.session_id,
        user_id=current_user.id,
    )

    return {
        "success": True,
        "message": f"Merged {merged_count} anonymous interaction(s) into your account.",
        "merged_count": merged_count,
    }

# ─── Lead Scoring Endpoints ───────────────────────────────────────────────────

@router.post("/predict-lead-score/{lead_id}", response_model=LeadScoreResponse)
async def predict_lead_score(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Predict conversion probability for a specific lead.
    """
    if current_user.role not in ["admin", "builder"]:
        raise HTTPException(status_code=403, detail="Only admins and builders can score leads.")

    result = LeadScoringService.predict_score(db, lead_id)
    if not result:
        raise HTTPException(status_code=404, detail="Lead not found.")

    # Optionally store the score in the database
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if lead:
        lead.lead_score = result["conversion_probability"]
        lead.lead_category = result["lead_category"]
        db.commit()

    return result

@router.post("/train-lead-model")
async def train_lead_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger retraining of the Lead Scoring XGBoost model.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can retrain the model.")

    success = LeadScoringService.train_model(db)
    if not success:
        raise HTTPException(status_code=400, detail="Retraining failed (possibly not enough data).")

    return {"success": True, "message": "Lead scoring model retrained successfully."}
