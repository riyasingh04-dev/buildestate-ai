import joblib
import shap
import pandas as pd
import os
import xgboost as xgb

MODEL_PATH = "lead_scoring_model.joblib"

def test_shap_fix():
    if not os.path.exists(MODEL_PATH):
        print("Model not found")
        return

    model = joblib.load(MODEL_PATH)
    print(f"Model loaded: {type(model)}")
    
    X = pd.DataFrame([{
        "price_match_score": 100000,
        "engagement_score": 10,
        "recency_score": 5,
        "property_match_score": 0.5,
        "is_returning_user": 1
    }])
    
    print("Attempting fix: passing booster and setting feature names...")
    try:
        booster = model.get_booster()
        # Some versions of SHAP need the feature names on the booster
        booster.feature_names = X.columns.tolist()
        
        explainer = shap.TreeExplainer(booster)
        shap_values = explainer.shap_values(X)
        print("Success with booster and TreeExplainer!")
        print(f"SHAP values shape: {shap_values.shape}")
    except Exception as e:
        print(f"Failed with booster fix: {e}")
        import traceback
        traceback.print_exc()

    print("\nAttempting fix: wrapping model in a way that SHAP likes...")
    try:
        # Sometimes passing the model.predict directly to Explainer works if we provide a masker
        explainer = shap.Explainer(model.predict, X)
        shap_values = explainer(X)
        print("Success with Explainer(model.predict, X)!")
    except Exception as e:
        print(f"Failed with Explainer(model.predict) fix: {e}")

if __name__ == "__main__":
    test_shap_fix()
