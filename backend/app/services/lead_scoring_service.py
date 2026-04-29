import pandas as pd # For data manipulation, especially during training and prediction
import numpy as np# For numerical operations
import xgboost as xgb# For the ML model (XGBoost)
import joblib# For saving and loading the model
import os# For file operations
import shap# For explainability of the ML model(explain predictions means it will help us understand why this lead is convert to buyer basically give explanation why this converted or not converted)
import math# For mathematical operations, especially for lead decay calculation
from datetime import datetime# For calculating recency score(recency score means how recent the user activity is, it will help us understand how active the user is)
from sqlalchemy.orm import Session#Used for database sessions
from sqlalchemy import func# For aggregate functions like max (used in recency score)
from app.models.lead import Lead#Used to interact with lead table
from app.models.property import Property#Used to interact with property table
from app.models.user import User#Used to interact with user table
from app.models.user_interaction import UserInteraction#Used to interact with user_interaction table

MODEL_PATH = "lead_scoring_model.joblib"#Path where the trained model will be saved and loaded from


class LeadScoringService:#This class encapsulates all the logic related to lead scoring, including feature engineering, model training, prediction, and real-time updates.

    # FEATURE ENGINEERING
    @staticmethod
    def calculate_features(db: Session, lead_id: int):#This method calculates the features for a given lead, which will be used for both training the model and making predictions. It retrieves the lead, associated property, and user information from the database, and then computes various features such as price match score, engagement score, recency score, property match score, and whether the user is a returning user.
        lead = db.query(Lead).filter(Lead.id == lead_id).first() #get data (fetch lead data from database)
        if not lead:
            return None

        prop = db.query(Property).filter(Property.id == lead.property_id).first()#fetch property data from database
        user = db.query(User).filter(User.id == lead.user_id).first() if lead.user_id else None#fetch user data from database if user_id is present in lead, otherwise set user to None

        # 1. Price Match Score(Smaller difference = better match)
        user_budget = getattr(user, 'budget', None) if user else None
        if user_budget and prop and prop.price:
            price_match_score = abs(float(user_budget) - float(prop.price))
        else:
            price_match_score = 0.0

        # 2. Engagement Score
        interactions = []
        if lead.user_id:
            interactions = db.query(UserInteraction).filter(
                UserInteraction.user_id == lead.user_id
            ).all()#fetch all interactions of the user from database and calculate engagement score based on the type of interaction (view, click, lead, visit) and assign different weights to each type of interaction (view=1, click=3, lead=10, visit=20)

        engagement_score = 0.0
        for inter in interactions:
            if inter.action == 'view':
                engagement_score += 1
            elif inter.action == 'click':
                engagement_score += 3
            elif inter.action == 'lead':
                engagement_score += 10
            elif inter.action == 'visit':
                engagement_score += 20

        # 3. Recency Score (how recent the user's last activity is, more recent = better score)
        last_activity = None
        if lead.user_id:
            last_activity = db.query(func.max(UserInteraction.timestamp)).filter(
                UserInteraction.user_id == lead.user_id
            ).scalar()

        if last_activity:
            days = (datetime.utcnow() - last_activity).days#How old the activity is, the more recent the activity, the higher the score
            recency_score = float(days)
        else:
            recency_score = 30.0

        # 4. Property Match Score (placeholder)
        property_match_score = 0.5

        # 5. Returning User
        is_returning_user = 0
        if lead.user_id:
            count = db.query(Lead).filter(Lead.user_id == lead.user_id).count()#If user came multiple times → serious buyer, if user came only once → just browsing
            is_returning_user = 1 if count > 1 else 0

        return {
            "price_match_score": float(price_match_score),
            "engagement_score": float(engagement_score),
            "recency_score": float(recency_score),
            "property_match_score": float(property_match_score),
            "is_returning_user": float(is_returning_user)
        }

    # MODEL TRAINING
    @staticmethod
    def train_model(db: Session):
        leads = db.query(Lead).all()
        if len(leads) < 10:
            print("Not enough data to train model.")
            return False

        data = []
        for lead in leads:
            features = LeadScoringService.calculate_features(db, lead.id)#Convert raw data → ML format (calculate features for each lead and prepare the dataset for training the model)
            if features:
                features['target'] = 1 if lead.converted else 0#1 buyer converted, 0 buyer not converted    
                data.append(features)

        df = pd.DataFrame(data)
        X = df.drop('target', axis=1)
        y = df['target']

        model = xgb.XGBClassifier(
            use_label_encoder=False,#To avoid warnings about label encoding, since our target is already binary
            eval_metric='logloss'#Logarithmic loss is a common evaluation metric for binary classification problems, which measures the performance of the model by comparing the predicted probabilities with the actual labels.
        )

        model.fit(X, y)
        joblib.dump(model, MODEL_PATH)#save the trained model to disk for later use in predictions

        return True

    # PREDICTION
    @staticmethod
    def predict_score(db: Session, lead_id: int, include_explanation: bool = False):#This method predicts the conversion probability and lead category for a given lead. It first calculates the features for the lead, then checks if the trained model exists. If the model is not available, it falls back to a heuristic scoring method based on engagement score and whether the user is a returning user. If the model is available, it uses the model to predict the conversion probability. Additionally, it applies a lead decay factor based on recency score to adjust the final score. If `include_explanation` is set to True, it also generates an explanation for the prediction using SHAP values.
        features = LeadScoringService.calculate_features(db, lead_id)
        if not features:
            return None

        # Fallback if model not trained
        if not os.path.exists(MODEL_PATH):
            engagement_points = features['engagement_score']
            score = min(1.0, (engagement_points / 30.0) +
                        (0.1 if features['is_returning_user'] else 0))
            category = LeadScoringService.get_category(score)

            return {
                "conversion_probability": float(score),
                "lead_category": category,
                "explanation": "Heuristic model"
            }

        model = joblib.load(MODEL_PATH)

        X = pd.DataFrame([features]).astype(float)

        prob = float(model.predict_proba(X)[0][1])

        # Hybrid scoring
        engagement_points = features['engagement_score']
        intent_score = min(1.0, (engagement_points / 30.0) +
                           (0.1 if features['is_returning_user'] else 0))

        final_score = max(prob, intent_score)

        # LEAD DECAY (older interactions → less likely to convert, so we apply a decay factor based on recency score)
        days = features['recency_score']
        decay_factor = math.exp(-days / 7)
        final_score = final_score * decay_factor

        category = LeadScoringService.get_category(final_score)

        explanation = None
        contributions_dict = {}

        # OPTIONAL SHAP (only if needed)
        if include_explanation:#If the caller requests an explanation for the prediction, we use SHAP to calculate the contribution of each feature to the final prediction. We create a SHAP explainer for the model and compute the SHAP values for the input features. We then identify the feature with the highest absolute contribution and generate a human-readable explanation based on that feature. Finally, we convert the contributions to a dictionary format for easier consumption.
            try:
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(X)

                values = shap_values[0] if isinstance(shap_values, list) else shap_values[0]
                contributions = dict(zip(X.columns, values))

                top_feature = max(contributions, key=lambda k: abs(contributions[k]))
                explanation = f"Lead is {category} due to {top_feature.replace('_', ' ')}."

                contributions_dict = {k: float(v) for k, v in contributions.items()}

            except Exception as e:
                print(f"SHAP error: {e}")
                explanation = f"Lead categorized as {category}"

        return {
            "conversion_probability": float(final_score),
            "lead_category": category,
            "explanation": explanation,
            "contributions": contributions_dict
        }

    
    # REAL-TIME UPDATE (This method can be called whenever there is a new user interaction or when a lead is updated. It recalculates the lead score and updates the lead record in the database accordingly.)
    @staticmethod
    def update_lead_score(db: Session, lead_id: int):
        result = LeadScoringService.predict_score(db, lead_id)
        if not result:
            return

        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return

        lead.lead_score = result["conversion_probability"]
        lead.lead_category = result["lead_category"]

        db.commit()


    # HELPERS(These helper methods are used to categorize the lead based on the predicted score and to determine the recommended action for the sales team based on the lead category.)
    @staticmethod
    def get_category(score):
        if score >= 0.8:
            return "Hot"
        if score >= 0.5:
            return "Warm"
        return "Cold"

    @staticmethod
    def get_recommended_action(category):
        if category == "Hot":
            return "Call immediately"
        if category == "Warm":
            return "Follow-up"
        return "Nurture"    