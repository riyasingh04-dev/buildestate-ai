import logging#Used for logging
from typing import Optional, List, Dict #Used to specify types of variables
from sqlalchemy.orm import Session #Used for database sessions

from app.models.user_interaction import UserInteraction #Used to interact with user_interactions table
from app.models.property import Property #Used to interact with property table
from app.services.collaborative_service import CollaborativeService #Used for collaborative filtering
from app.services.recommendation_service import RecommendationService #Used for content-based filtering

logger = logging.getLogger(__name__)

# Minimum interactions before switching from content-based to hybrid
COLD_START_THRESHOLD = 3

# Weight for collaborative vs content-based (0.7 = 70% collaborative, 30% content-based)
DEFAULT_ALPHA = 0.7


def _count_interactions(db: Session, user_id: Optional[int], session_id: Optional[str]) -> int:
    """Count how many unique interactions an entity has made."""
    query = db.query(UserInteraction)
    if user_id:
        query = query.filter(UserInteraction.user_id == user_id)
    elif session_id:
        query = query.filter(UserInteraction.session_id == session_id)
    else:
        return 0
    return query.count()


class HybridService:

    @staticmethod
    async def get_hybrid_recommendations(
        db: Session,
        top_k: int = 5,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        location: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        alpha: float = DEFAULT_ALPHA,
    ) -> Dict:
        """
        Hybrid recommendation strategy:
        - Cold start (< COLD_START_THRESHOLD interactions): pure content-based (Pinecone).
        - Warm/mature: weighted blend of collaborative + content-based.

        Final Score = alpha * collab_score + (1 - alpha) * content_score
        """
        interaction_count = _count_interactions(db, user_id, session_id)
        entity_label = f"user:{user_id}" if user_id else f"session:{session_id}"

        # ── Cold Start ──────────────────────────────────────────────────────────
        if interaction_count < COLD_START_THRESHOLD:
            logger.info(
                f"Cold start for {entity_label} ({interaction_count} interactions). "
                "Falling back to content-based."
            )
            content_recs = await RecommendationService.get_recommendations(
                db=db,
                top_k=top_k,
                user_id=user_id,
                session_id=session_id,
                location=location,
                min_price=min_price,
                max_price=max_price,
            )
            # If even content-based has nothing (zero interactions), return trending
            if not content_recs:
                trending = await RecommendationService.get_cold_start_recommendations(db, top_k)
                for rec in trending:
                    rec["source"] = "trending"
                return {
                    "strategy": "trending",
                    "interaction_count": interaction_count,
                    "recommendations": trending,
                }

            for rec in content_recs:
                rec["source"] = "content-based"
            return {
                "strategy": "content-based",
                "interaction_count": interaction_count,
                "recommendations": content_recs,
            }

        # ── Hybrid Strategy ─────────────────────────────────────────────────────
        logger.info(
            f"Hybrid strategy for {entity_label} ({interaction_count} interactions, alpha={alpha})."
        )

        collab_recs: List[Dict] = CollaborativeService.get_collaborative_recommendations(
            db=db, top_n=top_k * 2, user_id=user_id, session_id=session_id
        )
        content_recs: List[Dict] = await RecommendationService.get_recommendations(
            db=db,
            top_k=top_k * 2,
            user_id=user_id,
            session_id=session_id,
            location=location,
            min_price=min_price,
            max_price=max_price,
        )

        # Build score maps keyed by property_id
        collab_map: Dict[int, float] = {
            r["property_id"]: r["score"] for r in collab_recs
        }
        content_map: Dict[int, float] = {
            r["property_id"]: r["score"] for r in content_recs
        }

        # Normalize scores to [0,1] so they are comparable
        def normalize(scores: Dict[int, float]) -> Dict[int, float]:
            if not scores:
                return {}
            max_s = max(scores.values()) or 1.0
            return {k: v / max_s for k, v in scores.items()}

        collab_norm = normalize(collab_map)
        content_norm = normalize(content_map)

        # Union of all candidate property IDs
        all_pids = set(collab_norm.keys()) | set(content_norm.keys())

        hybrid_scores: Dict[int, float] = {}
        for pid in all_pids:
            c_score = collab_norm.get(pid, 0.0)
            cb_score = content_norm.get(pid, 0.0)
            hybrid_scores[pid] = alpha * c_score + (1 - alpha) * cb_score

        # Sort by combined score
        ranked = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

        # Build metadata for top results
        final_output = []
        for pid, score in ranked:
            prop = db.query(Property).filter(Property.id == pid).first()
            if prop:
                final_output.append({
                    "property_id": prop.id,
                    "score": round(score, 4),
                    "collab_score": round(collab_norm.get(pid, 0.0), 4),
                    "content_score": round(content_norm.get(pid, 0.0), 4),
                    "source": "hybrid",
                    "metadata": {
                        "title": prop.title,
                        "location": prop.location,
                        "price": prop.price,
                        "image_url": prop.image_url,
                    }
                })

        return {
            "strategy": "hybrid",
            "interaction_count": interaction_count,
            "alpha": alpha,
            "recommendations": final_output,
        }

    @staticmethod
    def merge_session_to_user(db: Session, session_id: str, user_id: int) -> int:
        """
        Called on login: migrate all anonymous interactions to the real user account.
        Returns the number of records updated.
        """
        interactions = (
            db.query(UserInteraction)
            .filter(
                UserInteraction.session_id == session_id,
                UserInteraction.user_id.is_(None)
            )
            .all()
        )

        count = 0
        for interaction in interactions:
            interaction.user_id = user_id
            interaction.session_id = None  # clear session after merging
            count += 1

        if count:
            db.commit()
            logger.info(f"Merged {count} interactions from session '{session_id}' → user {user_id}.")
        else:
            logger.info(f"No anonymous interactions found for session '{session_id}'.")

        return count
