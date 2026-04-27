import logging
import numpy as np
import json
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user_interaction import UserInteraction
from app.models.property import Property
from app.utils.pinecone_utils import get_pinecone, query_properties_with_filter, TEXT_DIMENSION #Pinecone helper functions
# Removed from app.utils.embeddings import TEXT_DIMENSION

logger = logging.getLogger(__name__)

ACTION_WEIGHTS = { #Defines importance of actions
    "view": 1,
    "click": 2,
    "lead": 3
}

class RecommendationService:#Recommendation logic lives here
    @staticmethod
    async def track_interaction(
        db: Session,
        property_id: int,
        action: str,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None
    ):
        """Track interaction for both logged-in (user_id) and anonymous (session_id) users."""
        if user_id is None and session_id is None:
            raise ValueError("Either user_id or session_id must be provided.")
        
        interaction = UserInteraction(
            user_id=user_id,
            session_id=session_id,
            property_id=property_id,
            action=action
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        return interaction

    @staticmethod
    async def get_recommendations(
        db: Session,
        top_k: int = 5,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        location: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ):
        # 1. Fetch user interactions for this entity (user or session)
        query = db.query(UserInteraction)
        if user_id:
            query = query.filter(UserInteraction.user_id == user_id)
        elif session_id:
            query = query.filter(UserInteraction.session_id == session_id)
        else:
            return []

        interactions = query.all()
        
        # If no history, return empty list so UI can hide the section
        if not interactions or len(interactions) < 1:
            return []

        # 2. Get property IDs and actions (Get all interacted properties)(Convert to string (Pinecone requires string IDs))
        interacted_property_ids = [str(i.property_id) for i in interactions]
        
        # 3. Retrieve embeddings from Pinecone (Get embeddings for interacted properties)
        _, index = get_pinecone("text")
        if not index:
            return []

        try:
            # Fetch vectors for interacted properties(Fetching vectors)
            fetch_results = index.fetch(ids=interacted_property_ids)
            vectors = fetch_results.vectors # Extract vectors (SDK returns object)
            
            if not vectors:
                return []

            # 4. Generate weighted user preference vector
            weighted_vectors = []
            total_weight = 0
            
            for inter in interactions: #Loop through interactions
                prop_id_str = str(inter.property_id)
                if prop_id_str in vectors:
                    # SDK returns Vector objects with .values attribute
                    vec = np.array(vectors[prop_id_str].values)
                    weight = ACTION_WEIGHTS.get(inter.action, 1)#get action weight
                    weighted_vectors.append(vec * weight)#multiply vector by weight
                    total_weight += weight#add weight to total weight
            
            if not weighted_vectors:
                return []

            user_vector = np.sum(weighted_vectors, axis=0) / total_weight
            
            # 5. Query Pinecone for similar properties
            # We increase top_k slightly to account for excluded properties
            matches = query_properties_with_filter(
                query_embedding=user_vector.tolist(),
                top_k=top_k + len(interacted_property_ids),
                location=location,
                min_price=min_price,
                max_price=max_price
            )
            # 6. Exclude already seen properties (Try to find NEW properties first)
            recommendations = []
            seen_ids = set(interacted_property_ids)
            
            for m in matches:
                if m.id not in seen_ids:
                    recommendations.append({
                        "property_id": int(m.id),
                        "score": m.score,
                        "metadata": m.metadata
                    })
                
                if len(recommendations) >= top_k:
                    break
            
            # 7. Fallback: If no new properties are found (e.g. user saw everything), 
            # show the top personalized results even if they've been seen.
            if not recommendations and matches:
                for m in matches[:top_k]:
                    recommendations.append({
                        "property_id": int(m.id),
                        "score": m.score,
                        "metadata": m.metadata
                    })

            return recommendations

        except Exception as e:
            logger.error(f"Error generating recommendations for user {user_id}: {e}")
            return []

    @staticmethod
    async def get_cold_start_recommendations(db: Session, top_k: int):
        # Return latest approved properties
        latest_props = db.query(Property).filter(Property.admin_status == "approved").order_by(Property.created_at.desc()).limit(top_k).all()
        return [
            {
                "property_id": p.id,
                "score": 0.0,
                "metadata": {
                    "title": p.title,
                    "location": p.location,
                    "price": p.price,
                    "image_url": p.image_url
                }
            }
            for p in latest_props
        ]
