import json
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict

# Initialize the model (it will download on first run)
# Using a small, efficient model
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> List[float]:
    """Generates an embedding for the given text."""
    if not text:
        return []
    embedding = model.encode(text)
    return embedding.tolist()

def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Computes cosine similarity between two vectors."""
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    if np.linalg.norm(v1) == 0 or np.linalg.norm(v2) == 0:
        return 0.0
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def format_property_for_embedding(title: str, description: str, amenities: str = "") -> str:
    """Formats property data into a single string for embedding."""
    return f"Title: {title}. Description: {description}. Amenities: {amenities or 'None'}"
