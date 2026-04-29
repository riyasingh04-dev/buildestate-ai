import joblib
import shap
import pandas as pd
import os
import json
import xgboost as xgb

MODEL_PATH = "lead_scoring_model.joblib"

def test_shap_load_config_fix():
    if not os.path.exists(MODEL_PATH):
        print("Model not found")
        return

    model = joblib.load(MODEL_PATH)
    booster = model.get_booster()
    config = json.loads(booster.save_config())
    
    try:
        base_score_str = config["learner"]["learner_model_param"]["base_score"]
        if isinstance(base_score_str, str) and base_score_str.startswith("[") and base_score_str.endswith("]"):
            # Strip brackets
            new_base_score = base_score_str[1:-1]
            config["learner"]["learner_model_param"]["base_score"] = new_base_score
            print(f"Fixed base_score: {new_base_score}")
            booster.load_config(json.dumps(config))
    except Exception as e:
        print(f"Failed to fix config: {e}")

    X = pd.DataFrame([{
        "price_match_score": 100000,
        "engagement_score": 10,
        "recency_score": 5,
        "property_match_score": 0.5,
        "is_returning_user": 1
    }])
    
    print("Attempting SHAP with fixed booster...")
    try:
        explainer = shap.TreeExplainer(booster)
        shap_values = explainer.shap_values(X)
        print("Success with fixed booster!")
        print(f"SHAP values sample: {shap_values[0]}")
    except Exception as e:
        print(f"Failed even with fixed booster: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_shap_load_config_fix()
