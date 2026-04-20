import requests

url = "http://localhost:8000/ai/chat/"
data = {"message": "serene getaway", "session_id": "test_session"}

try:
    response = requests.post(url, json=data)
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
