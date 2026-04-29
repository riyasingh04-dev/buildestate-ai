import joblib
import shap
import pandas as pd
import os

MODEL_PATH = "lead_scoring_model.joblib"

def test_shap():
    if not os.path.exists(MODEL_PATH):
        print("Model not found")
        return

    model = joblib.load(MODEL_PATH)
    print(f"Model loaded: {type(model)}")
    
    # Dummy data with correct columns
    # price_match_score, engagement_score, recency_score, property_match_score, is_returning_user
    X = pd.DataFrame([{
        "price_match_score": 100000,
        "engagement_score": 10,
        "recency_score": 5,
        "property_match_score": 0.5,
        "is_returning_user": 1
    }])
    
    print("Attempting shap.TreeExplainer(model)...")
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        print("Success with TreeExplainer")
    except Exception as e:
        print(f"Failed with TreeExplainer: {e}")
        
    print("\nAttempting shap.Explainer(model)...")
    try:
        explainer = shap.Explainer(model)
        shap_values = explainer(X)
        print("Success with Explainer")
    except Exception as e:
        print(f"Failed with Explainer: {e}")

if __name__ == "__main__":
    test_shap()
