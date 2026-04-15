import requests
import json

BASE_URL = "http://127.0.0.1:8000"

properties = [
    {
        "title": "Azure Penthouse",
        "description": "Experience the pinnacle of luxury in this New York penthouse. Featuring 20-foot ceilings, a private rooftop pool, and 360-degree views of the Manhattan skyline. Pure indulgence in the heart of the city.",
        "price": 5200000.0,
        "location": "Upper East Side, NYC",
        "bedrooms": 4,
        "bathrooms": 5,
        "area": 4500.0,
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200"
    },
    {
        "title": "Emerald Garden Villa",
        "description": "A tranquil sanctuary nestled in the lush jungles of Bali. This open-concept villa blends traditional Balinese architecture with modern minimalism. Private infinity pool overlooking rice terraces.",
        "price": 1850000.0,
        "location": "Ubud, Bali",
        "bedrooms": 3,
        "bathrooms": 3,
        "area": 2800.0,
        "status": "Under Offer",
        "image_url": "https://images.unsplash.com/photo-1580587767073-38a49509ae12?q=80&w=1200"
    },
    {
        "title": "Silver Oak Mansion",
        "description": "An architectural masterpiece in London's prestigious Kensington district. 7 bedrooms, a wine cellar, private cinema, and heated gardens. The ultimate family estate.",
        "price": 8500000.0,
        "location": "Kensington, London",
        "bedrooms": 7,
        "bathrooms": 8,
        "area": 12000.0,
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"
    },
    {
        "title": "Neon City Loft",
        "description": "Industrial-chic living in the vibrant Shibuya district. High-tech automation, floor-to-ceiling windows, and a minimalist design aesthetic for the modern urbanite.",
        "price": 2400000.0,
        "location": "Shibuya, Tokyo",
        "bedrooms": 2,
        "bathrooms": 2,
        "area": 1500.0,
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1512632571867-70ee5daef6ec?q=80&w=1200"
    },
    {
        "title": "Coral Reef Retreat",
        "description": "Overwater bungalow experience with permanent residence comfort. Crystal clear lagoons at your doorstep, private deck, and glass-floor sections to view the marine life.",
        "price": 3100000.0,
        "location": "Baa Atoll, Maldives",
        "bedrooms": 3,
        "bathrooms": 3,
        "area": 2200.0,
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=1200"
    },
    {
        "title": "Alpine Peak Lodge",
        "description": "Ski-in ski-out luxury at its finest. This Swiss chalet features reclaimed wood interiors, a massive stone fireplace, and a wellness spa with mountain views.",
        "price": 4750000.0,
        "location": "Zermatt, Switzerland",
        "bedrooms": 5,
        "bathrooms": 6,
        "area": 5500.0,
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200"
    },
    {
        "title": "Desert Mirage Estate",
        "description": "A sprawling estate combining Arabian luxury with futuristic design. Temperature-controlled outdoor areas, private oasis, and a 12-car underground gallery.",
        "price": 6900000.0,
        "location": "Palm Jumeirah, Dubai",
        "bedrooms": 8,
        "bathrooms": 10,
        "area": 18000.0,
        "status": "Sold",
        "image_url": "https://images.unsplash.com/photo-1541824276466-98b9b3cf47b5?q=80&w=1200"
    },
    {
        "title": "Redwood Sanctuary",
        "description": "Modern glass house hidden among the ancient Redwoods. Designed to disappear into nature, this home features sustainable materials and complete privacy.",
        "price": 3500000.0,
        "location": "Big Sur, California",
        "bedrooms": 4,
        "bathrooms": 3,
        "area": 3200.0,
        "status": "Available",
        "image_url": "https://images.unsplash.com/photo-1449156001437-3a144f007e10?q=80&w=1200"
    }
]

def seed():
    print("--- Starting Database Seeding ---")
    
    # 1. Register Builder
    builder_creds = {
        "name": "Global Premium Builder",
        "email": f"globalbuilder@buildestate.com",
        "password": "securepassword123",
        "role": "builder"
    }
    
    reg_res = requests.post(f"{BASE_URL}/auth/register", json=builder_creds)
    if reg_res.status_code == 200 or reg_res.status_code == 201:
        print("Registered Global Builder")
    else:
        print(f"Builder registration status: {reg_res.status_code} (User might already exist)")

    # 2. Login
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": builder_creds["email"],
        "password": builder_creds["password"]
    }).json()
    token = login_res["access_token"]
    print("Logged in successfully")

    # 3. Add Properties
    headers = {"Authorization": f"Bearer {token}"}
    for prop in properties:
        res = requests.post(f"{BASE_URL}/properties/", json=prop, headers=headers)
        if res.status_code == 200:
            print(f"Seeded: {prop['title']}")
        else:
            print(f"Failed to seed {prop['title']}: {res.text}")

    print("--- Seeding Completed Successfully ---")

if __name__ == "__main__":
    seed()
