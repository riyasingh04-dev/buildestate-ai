import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath("d:/BuildEstate_AI/backend"))

try:
    from app.utils.embeddings import get_embedding
    print("Testing get_embedding...")
    emb = get_embedding("test string")
    print(f"Embedding length: {len(emb)}")
    print("First 5 values:", emb[:5])
except Exception as e:
    print(f"Error: {e}")
