import pandas as pd#Used to manipulate dataframes
import numpy as np #Used for numerical operations
from sklearn.metrics.pairwise import cosine_similarity #Used to calculate cosine similarity
from sqlalchemy.orm import Session #Used for database sessions
from app.models.user_interaction import UserInteraction #Used to interact with user_interactions table
from app.models.property import Property #Used to interact with property table
from typing import List, Dict, Optional#Used to specify types of variables
import logging #Used for logging

logger = logging.getLogger(__name__)#Used to log messages


def _build_entity_id(user_id: Optional[int], session_id: Optional[str]) -> Optional[str]:#Used to create a unified identifier for the user-item matrix
    """
    Creates a unified identifier for the user-item matrix.
    Logged-in users:   'u_123'
    Anonymous sessions: 's_abc-xyz'
    """
    if user_id:
        return f"u_{user_id}"
    if session_id:
        return f"s_{session_id}"
    return None


class CollaborativeService:# Used for collaborative filtering

    @staticmethod
    def _build_user_item_matrix(interactions: list):#Used to build a user-item matrix
        """
        Converts raw interactions into a weighted user-item pivot matrix
        using a unified entity_id for both users and sessions.
        """
        weights = {"view": 1, "click": 2, "lead": 3}

        data = []
        for i in interactions:
            entity_id = _build_entity_id(i.user_id, i.session_id)
            if entity_id is None:
                continue
            data.append({
                "entity_id": entity_id,
                "property_id": i.property_id,
                "score": weights.get(i.action, 1)
            })

        if not data:
            return None, None

        df = pd.DataFrame(data)
        # Keep highest intent action per entity-property pair
        df = df.groupby(["entity_id", "property_id"])["score"].max().reset_index()

        matrix = df.pivot(
            index="entity_id", columns="property_id", values="score"
        ).fillna(0)

        return matrix, df

    @staticmethod
    def get_collaborative_recommendations(#Used to get recommendations based on collaborative filtering
        db: Session,
        top_n: int = 5,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
    ) -> List[Dict]: #Used to get recommendations based on collaborative filtering
        """
        Item-based collaborative filtering for any entity (user or session).
        1. Builds a unified user-item matrix.
        2. Computes item-item cosine similarity.
        3. Scores unseen properties for the entity.
        """
        entity_id = _build_entity_id(user_id, session_id)#Used to create a unified identifier for the user-item matrix
        if not entity_id:
            logger.warning("No entity_id provided for collaborative filtering.")
            return []

        try:
            interactions = db.query(UserInteraction).all()
            if not interactions:
                logger.info("No interactions found for collaborative filtering.")
                return []

            user_item_matrix, _ = CollaborativeService._build_user_item_matrix(interactions)
            if user_item_matrix is None:
                return []

            # Cold-start: entity not in matrix yet
            if entity_id not in user_item_matrix.index:
                logger.info(f"Entity '{entity_id}' not in interaction matrix (cold start).")
                return []

            # Item-item similarity on transposed matrix (items as rows)
            item_sim_matrix = cosine_similarity(user_item_matrix.T)
            item_sim_df = pd.DataFrame(
                item_sim_matrix,
                index=user_item_matrix.columns,
                columns=user_item_matrix.columns
            )

            entity_ratings = user_item_matrix.loc[entity_id]
            interacted_ids = entity_ratings[entity_ratings > 0].index.tolist()

            # Weighted sum of similarities normalized by similarity totals
            sim_sum = item_sim_df.sum(axis=1).replace(0, 1)
            entity_scores = item_sim_df.dot(entity_ratings) / sim_sum

            # Remove already-seen properties
            recommendations = entity_scores.drop(
                index=[pid for pid in interacted_ids if pid in entity_scores.index]
            ).sort_values(ascending=False)

            top_ids = recommendations.head(top_n).index.tolist()
            final_output = []
            for pid in top_ids:
                prop = db.query(Property).filter(Property.id == pid).first()
                if prop:
                    final_output.append({
                        "property_id": prop.id,
                        "score": round(float(entity_scores[pid]), 4),
                        "source": "collaborative",
                        "metadata": {
                            "title": prop.title,
                            "location": prop.location,
                            "price": prop.price,
                            "image_url": prop.image_url
                        }
                    })

            return final_output

        except Exception as e:
            logger.error(f"Error in collaborative filtering for entity '{entity_id}': {e}")
            return []
