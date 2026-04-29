import joblib
import json
import os

MODEL_PATH = "lead_scoring_model.joblib"

def inspect_model():
    if not os.path.exists(MODEL_PATH):
        print("Model not found")
        return

    model = joblib.load(MODEL_PATH)
    booster = model.get_booster()
    config = json.loads(booster.save_config())
    
    # Check learner -> learner_model_param -> base_score
    try:
        base_score = config["learner"]["learner_model_param"]["base_score"]
        print(f"base_score in config: {base_score} (type: {type(base_score)})")
    except KeyError:
        print("Could not find base_score in config")
        print(json.dumps(config, indent=2)[:1000])

if __name__ == "__main__":
    inspect_model()
