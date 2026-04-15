import requests

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    print("--- Starting Verification Flow ---")
    
    # 1. Register Builder
    builder_data = {
        "name": "Builder Bob",
        "email": "builder@example.com",
        "password": "password123",
        "role": "builder"
    }
    requests.post(f"{BASE_URL}/auth/register", json=builder_data)
    print("Registered Builder")

    # 2. Register User
    user_data = {
        "name": "User Alice",
        "email": "alice@example.com",
        "password": "password123",
        "role": "user"
    }
    requests.post(f"{BASE_URL}/auth/register", json=user_data)
    print("Registered User")

    # 3. Login Builder
    login_builder = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "builder@example.com",
        "password": "password123"
    }).json()
    builder_token = login_builder["access_token"]
    print("Logged in Builder")

    # 4. Login User
    login_user = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "alice@example.com",
        "password": "password123"
    }).json()
    user_token = login_user["access_token"]
    print("Logged in User")

    # 5. Builder: Create Property
    prop_data = {
        "title": "Sunset Villa",
        "description": "A beautiful villa by the sea",
        "price": 500000.0,
        "location": "Coastal Road"
    }
    prop_res = requests.post(
        f"{BASE_URL}/properties/", 
        json=prop_data,
        headers={"Authorization": f"Bearer {builder_token}"}
    ).json()
    property_id = prop_res["id"]
    print(f"Builder created property ID: {property_id}")

    # 6. User: Browse Properties
    all_props = requests.get(f"{BASE_URL}/properties/").json()
    print(f"User found {len(all_props)} properties")

    # 7. User: Create Lead
    lead_data = {
        "property_id": property_id,
        "message": "I am interested in this villa!"
    }
    requests.post(
        f"{BASE_URL}/leads/",
        json=lead_data,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    print("User created interest lead")

    # 8. Builder: View Leads
    leads = requests.get(
        f"{BASE_URL}/leads/",
        headers={"Authorization": f"Bearer {builder_token}"}
    ).json()
    print(f"Builder found {len(leads)} leads for their properties")
    
    print("--- Test Completed Successfully ---")

if __name__ == "__main__":
    test_flow()
