import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os

from sqlalchemy.orm import Session
from app.models.property import Property

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error

MODEL_PATH = "property_scoring_model.joblib"


class PropertyScoringService:

    @staticmethod
    def calculate_features(prop: Property):
        size_score = min(1.0, prop.area / 2000.0)

        price_per_sqft = prop.price / prop.area if prop.area > 0 else 0
        value_score = min(1.0, price_per_sqft / 5000.0)

        amenities = prop.amenities.lower() if prop.amenities else ""
        amenity_list = [a.strip() for a in amenities.split(",")]

        score = 0
        if "pool" in amenity_list or "swimming pool" in amenity_list:
            score += 3
        if "wifi" in amenity_list:
            score += 2
        if "gym" in amenity_list:
            score += 2
        if "parking" in amenity_list:
            score += 1
        if "security" in amenity_list:
            score += 1

        amenities_score = min(1.0, score / 9.0)

        return {
            "size_score": float(size_score),
            "value_score": float(value_score),
            "amenities_score": float(amenities_score),
            "bedrooms": float(prop.bedrooms),
            "bathrooms": float(prop.bathrooms)
        }

    @staticmethod
    def prepare_dataset(db: Session):
        properties = db.query(Property).all()

        data = []
        for prop in properties:
            features = PropertyScoringService.calculate_features(prop)

            # Synthetic target
            target = (
                features["size_score"] * 0.3 +
                features["value_score"] * 0.3 +
                features["amenities_score"] * 0.4
            ) * 10

            features["target"] = target
            data.append(features)

        df = pd.DataFrame(data)
        X = df.drop("target", axis=1)
        y = df["target"]

        return X, y

    @staticmethod
    def train_and_compare_models(db: Session):
        print("\n TRAINING FUNCTION STARTED")

        X, y = PropertyScoringService.prepare_dataset(db)

        if len(X) < 10:
            print(" Not enough data to train model")
            return False

        # Train/Test Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        #XGBoost
        xgb_model = xgb.XGBRegressor(
            objective="reg:squarederror",
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5
        )

        xgb_model.fit(X_train, y_train)
        xgb_preds = xgb_model.predict(X_test)

        xgb_r2 = r2_score(y_test, xgb_preds)
        xgb_rmse = mean_squared_error(y_test, xgb_preds) ** 0.5

        #Linear Regression 
        lr_model = LinearRegression()
        lr_model.fit(X_train, y_train)

        lr_preds = lr_model.predict(X_test)

        lr_r2 = r2_score(y_test, lr_preds)
        lr_rmse = mean_squared_error(y_test, lr_preds) ** 0.5

        # PRINT RESULTS
        print("\n MODEL COMPARISON RESULTS")
        print("-" * 40)

        print(f"XGBoost R2 Score      : {xgb_r2:.4f}")
        print(f"XGBoost RMSE          : {xgb_rmse:.4f}")
        print(f"XGBoost Accuracy (%)  : {xgb_r2 * 100:.2f}%")

        print("-" * 40)

        print(f"Linear Regression R2  : {lr_r2:.4f}")
        print(f"Linear Regression RMSE: {lr_rmse:.4f}")
        print(f"Linear Accuracy (%)   : {lr_r2 * 100:.2f}%")

        print("-" * 40)

        # SELECT BEST
        if xgb_r2 >= lr_r2:
            best_model = xgb_model
            print(" Selected Model: XGBoost")
        else:
            best_model = lr_model
            print(" Selected Model: Linear Regression")

        # Save best model
        joblib.dump(best_model, MODEL_PATH)
        print(" Model saved successfully")

        return True

    @staticmethod
    def predict_score(prop: Property):
        features = PropertyScoringService.calculate_features(prop)

        if not os.path.exists(MODEL_PATH):
            score = (
                features["size_score"] * 0.3 +
                features["value_score"] * 0.3 +
                features["amenities_score"] * 0.4
            ) * 10

            return round(max(1.0, min(10.0, score)), 1)

        model = joblib.load(MODEL_PATH)
        X = pd.DataFrame([features])
        score = float(model.predict(X)[0])

        return round(max(1.0, min(10.0, score)), 1)

    @staticmethod
    def update_all_scores(db: Session):
        properties = db.query(Property).all()

        for prop in properties:
            score = PropertyScoringService.predict_score(prop)
            prop.property_score = score

            if score >= 8.5:
                prop.property_category = "Luxury"
            elif score >= 6.0:
                prop.property_category = "Standard"
            else:
                prop.property_category = "Economy"

        db.commit()