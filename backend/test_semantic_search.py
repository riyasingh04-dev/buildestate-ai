import os
from dotenv import load_dotenv
from app.ai.tools import search_properties

load_dotenv()

def test_search():
    print("Testing semantic search...")
    query = "peaceful retreats"
    print(f"Query: {query}")
    
    results = search_properties.invoke({"query": query})
    
    print("\nResults:")
    for i, r in enumerate(results):
        print(f"{i+1}. {r['title']} - {r['location']} (Price: {r['price']})")
        print(f"   Amenities: {r['amenities']}")
        print("-" * 20)

if __name__ == "__main__":
    test_search()
