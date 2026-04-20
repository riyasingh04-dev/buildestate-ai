import os
from dotenv import load_dotenv
from app.ai.tools import search_properties

load_dotenv()

def test_repro():
    print("Reproduction test for 'serene getaway'...")
    try:
        results = search_properties.invoke({"query": "serene getaway"})
        print("Success!")
        for r in results:
            print(f"- {r['title']}")
    except Exception as e:
        print(f"FAILED with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_repro()
