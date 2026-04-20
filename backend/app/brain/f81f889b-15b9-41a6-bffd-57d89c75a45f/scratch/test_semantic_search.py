import sys
import os
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.path.abspath("d:/BuildEstate_AI/backend"))

load_dotenv()

from app.ai.tools import search_properties

def test_semantic():
    print("Testing semantic search for 'peaceful retreats'...")
    results = search_properties(query="peaceful retreats")
    print(f"Found {len(results)} results.")
    for r in results:
        print(f"- {r['title']} ({r['location']})")

if __name__ == "__main__":
    test_semantic()
