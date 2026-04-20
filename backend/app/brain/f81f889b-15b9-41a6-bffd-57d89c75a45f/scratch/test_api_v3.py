import requests
import json

url = "http://localhost:8000/ai/chat/"
data = {"message": "Show me some peaceful retreats", "session_id": "test_session_2"}

try:
    response = requests.post(url, json=data)
    result = {
        "status_code": response.status_code,
        "response": response.json()
    }
    with open("api_test_result_v3.json", "w") as f:
        json.dump(result, f, indent=4)
    print("Result saved to api_test_result_v3.json")
except Exception as e:
    print("Error:", e)
