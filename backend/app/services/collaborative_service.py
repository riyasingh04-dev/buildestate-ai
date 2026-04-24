import pandas as pd #Used for data manipulation and matrix operations.
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity#used to compute similarity between properties.
from sqlalchemy.orm import Session#Used to interact with your database.
from app.models.user_interaction import UserInteraction #ORM models for fetching interaction data 
from app.models.property import Property#ORM models for fetching property details.
from typing import List, Dict#typehints for better code clarity and error checking.
import logging

logger = logging.getLogger(__name__)

class CollaborativeService:#Service layer where collaborative filtering logic lives.
    @staticmethod
    def get_collaborative_recommendations(db: Session, user_id: int, top_n: int = 5) -> List[Dict]:
        """
        Generates item-based collaborative filtering recommendations.
        1. Builds user-item matrix from DB interactions.
        2. Calculates property similarity using cosine similarity.
        3. Predicts user preference for unseen properties.
        """
        try:
            # 1. Fetch Interactions from DB
            interactions = db.query(UserInteraction).all() #Pull all user activity (view, click, lead)
            if not interactions:
                logger.info("No interactions found for collaborative filtering.")
                return []

            # 2. Prepare Data Structure (convert db data to tabular format for matrix operations)
            data = [
                {"user_id": i.user_id, "property_id": i.property_id, "action": i.action}
                for i in interactions
            ]
            df = pd.DataFrame(data)

            # 3. Apply Interaction Weights
            weights = {"view": 1, "click": 2, "lead": 3}
            df['score'] = df['action'].map(weights)

            # Handle duplicate interactions (take the highest intent action)
            #If user interacted multiple times:Keep highest intent action
            df = df.groupby(['user_id', 'property_id'])['score'].max().reset_index()

            # 4. Create User-Item Pivot Table
            # Rows = Users, Columns = Properties
            user_item_matrix = df.pivot(index='user_id', columns='property_id', values='score').fillna(0)

            # 5. Cold Start Check: If user has no interactions : Can't compute similarity, return empty list so UI can hide the section
            if user_id not in user_item_matrix.index:
                logger.info(f"User {user_id} is a cold start user for collaborative filtering.")
                return []

            # 6. Compute Item-Item Similarity Matrix
            # Using Cosine Similarity on the transposed matrix (Properties as rows)
            item_sim_matrix = cosine_similarity(user_item_matrix.T)
            item_sim_df = pd.DataFrame(
                item_sim_matrix, 
                index=user_item_matrix.columns, 
                columns=user_item_matrix.columns
            )

            # 7. Generate Scores for Target User
            user_ratings = user_item_matrix.loc[user_id]
            interacted_ids = user_ratings[user_ratings > 0].index.tolist()
            
            # Dot product of similarities and user ratings gives the raw score
            # Divide by sum of similarities for normalization
            sim_sum = item_sim_df.sum(axis=1)
            # Avoid division by zero
            sim_sum = sim_sum.replace(0, 1)
            
            user_scores = item_sim_df.dot(user_ratings) / sim_sum
            
            # 8. Filter and Rank
            # Remove properties the user has already interacted with
            recommendations = user_scores.drop(index=interacted_ids).sort_values(ascending=False)

            # 9. Retrieve Metadata and return top N
            top_ids = recommendations.head(top_n).index.tolist()
            final_output = []
            
            for pid in top_ids:
                prop = db.query(Property).filter(Property.id == pid).first()
                if prop:
                    final_output.append({
                        "property_id": prop.id,
                        "score": round(float(user_scores[pid]), 4),
                        "metadata": {
                            "title": prop.title,
                            "location": prop.location,
                            "price": prop.price,
                            "image_url": prop.image_url
                        }
                    })
            
            return final_output

        except Exception as e:
            logger.error(f"Error in collaborative filtering: {e}")
            return []
