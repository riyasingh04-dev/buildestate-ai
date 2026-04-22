"""
Embedding utilities for BuildEstate AI.

Text embeddings  : all-MiniLM-L6-v2 (384-dim) — fast, already indexed in Pinecone
Image embeddings : clip-ViT-B-32 (512-dim) — stored in a SEPARATE Pinecone namespace
                   so we don't need to re-index the existing text vectors.
"""

import os
import io
import logging
import requests
import numpy as np
from typing import List, Optional

from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model singletons (loaded once at import time)
# ---------------------------------------------------------------------------
_text_model: Optional[SentenceTransformer] = None
_clip_model: Optional[SentenceTransformer] = None


def _get_text_model() -> SentenceTransformer:
    global _text_model
    if _text_model is None:
        logger.info("Loading text embedding model (all-MiniLM-L6-v2)…")
        _text_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _text_model


def _get_clip_model() -> SentenceTransformer:
    """Lazy-load the CLIP model only when image search is used."""
    global _clip_model
    if _clip_model is None:
        logger.info("Loading CLIP model (clip-ViT-B-32)…")
        _clip_model = SentenceTransformer("clip-ViT-B-32")
    return _clip_model


# ---------------------------------------------------------------------------
# Text embedding (384-dim)
# ---------------------------------------------------------------------------

def get_embedding(text: str) -> List[float]:
    """Generate a 384-dim text embedding for the given text."""
    if not text or not text.strip():
        return []
    embedding = _get_text_model().encode(text, normalize_embeddings=True)
    return embedding.tolist()


# ---------------------------------------------------------------------------
# Property text formatting — rich, includes ALL filterable fields
# ---------------------------------------------------------------------------

def format_property_for_embedding(
    title: str,
    description: str,
    amenities: str = "",
    location: str = "",
    bedrooms: int = 0,
    bathrooms: int = 0,
    price: float = 0.0,
    status: str = "",
) -> str:
    """
    Serialize property fields into a single sentence for embedding.
    Richer text → better semantic search quality.
    """
    parts = [
        f"Title: {title}.",
        f"Description: {description}.",
        f"Location: {location or 'Unknown'}.",
        f"Price: {price:,.0f} INR.",
        f"Bedrooms: {bedrooms}, Bathrooms: {bathrooms}.",
        f"Amenities: {amenities or 'None'}.",
        f"Status: {status or 'Available'}.",
    ]
    return " ".join(parts)


# ---------------------------------------------------------------------------
# Image embedding (512-dim, via CLIP — stored in separate Pinecone namespace)
# ---------------------------------------------------------------------------

def get_image_embedding(image_url: str) -> List[float]:
    """
    Download an image from `image_url` and return a 512-dim CLIP embedding.
    Returns [] on failure.
    """
    try:
        from PIL import Image  # lazy import — only needed for image search

        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert("RGB")

        model = _get_clip_model()
        embedding = model.encode(image, normalize_embeddings=True)
        return embedding.tolist()

    except Exception as exc:
        logger.warning("Failed to generate image embedding for %s: %s", image_url, exc)
        return []


def get_image_embedding_from_text(text_query: str) -> List[float]:
    """
    Generate a CLIP text embedding (512-dim) so a text query can be compared
    against image vectors stored in the image namespace.
    """
    try:
        model = _get_clip_model()
        embedding = model.encode(text_query, normalize_embeddings=True)
        return embedding.tolist()
    except Exception as exc:
        logger.warning("Failed to generate CLIP text embedding: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Legacy helper (kept for backwards compatibility)
# ---------------------------------------------------------------------------

def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    v1, v2 = np.array(vec1), np.array(vec2)
    n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
    if n1 == 0 or n2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (n1 * n2))
