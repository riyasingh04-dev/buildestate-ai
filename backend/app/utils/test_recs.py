import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_recommendations(user_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Simulate interaction
    print("\n--- Simulating Interaction ---")
    interact_payload = {
        "property_id": 1,
        "action": "click"
    }
    res = requests.post(f"{BASE_URL}/ml/interact", json=interact_payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(res.json())

    # 2. Get recommendations
    print("\n--- Getting Recommendations ---")
    res = requests.get(f"{BASE_URL}/ml/recommendations/{user_id}", headers=headers)
    print(f"Status: {res.status_code}")
    recs = res.json()
    print(json.dumps(recs, indent=2))

if __name__ == "__main__":
    # Note: Requires a valid user_id and token from login
    print("This script is for manual verification after obtaining an auth token.")
