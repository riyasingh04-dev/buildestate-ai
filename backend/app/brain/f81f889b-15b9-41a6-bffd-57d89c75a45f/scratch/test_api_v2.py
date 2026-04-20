import requests
import json

url = "http://localhost:8000/ai/chat/"
data = {"message": "serene getaway", "session_id": "test_session"}

try:
    response = requests.post(url, json=data)
    result = {
        "status_code": response.status_code,
        "response": response.json()
    }
    with open("api_test_result.json", "w") as f:
        json.dump(result, f, indent=4)
    print("Result saved to api_test_result.json")
except Exception as e:
    print("Error:", e)
