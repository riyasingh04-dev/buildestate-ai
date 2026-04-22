"""
Pinecone utility layer for BuildEstate AI.

Two separate indexes are used because dimensions differ:
  - real-estate        (384-dim) → Text embeddings (all-MiniLM-L6-v2)
  - real-estate-images (512-dim) → Image embeddings (clip-ViT-B-32)

Pinecone metadata filter format (used in query):
  https://docs.pinecone.io/guides/data/filter-with-metadata
"""

import os
import logging
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

logger = logging.getLogger(__name__)

# Config

PINECONE_API_KEY          = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME        = os.getenv("PINECONE_INDEX_NAME", "real-estate")
PINECONE_IMAGE_INDEX_NAME  = os.getenv("PINECONE_IMAGE_INDEX_NAME", "real-estate-images")

TEXT_DIMENSION      = 384   # all-MiniLM-L6-v2
IMAGE_DIMENSION     = 512   # clip-ViT-B-32

# Singleton client + indexes (initialized on first use) #global singleton (only one connection created resused everywhere) and index objects for text and image indexes
_pc: Optional[Pinecone]  = None
_text_index              = None
_image_index             = None


def get_pinecone(index_type: str = "text"):
    """
    Return (pc_client, index). Initialises once per process.
    index_type can be "text" or "image".
    """
    global _pc, _text_index, _image_index

    if _pc is None:
        if not PINECONE_API_KEY:
            logger.warning("PINECONE_API_KEY is not set — vector search disabled.")
            return None, None
        _pc = Pinecone(api_key=PINECONE_API_KEY)

    target_index_name = PINECONE_INDEX_NAME if index_type == "text" else PINECONE_IMAGE_INDEX_NAME
    target_dimension  = TEXT_DIMENSION if index_type == "text" else IMAGE_DIMENSION
    
    # Check if we already have the index object
    if index_type == "text" and _text_index is not None:
        return _pc, _text_index
    if index_type == "image" and _image_index is not None:
        return _pc, _image_index

    existing = _pc.list_indexes().names()
    if target_index_name not in existing:
        logger.info("Creating Pinecone index '%s' (dim=%d)…", target_index_name, target_dimension)
        _pc.create_index(
            name=target_index_name,
            dimension=target_dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    idx = _pc.Index(target_index_name)
    if index_type == "text":
        _text_index = idx
    else:
        _image_index = idx
        
    logger.info("Pinecone index '%s' ready.", target_index_name)
    return _pc, idx


# Build rich metadata dict from a property ORM object (or raw kwargs)

def build_metadata(
    title: str       = "",
    location: str    = "",
    price: float     = 0.0,
    bedrooms: int    = 0,
    bathrooms: int   = 0,
    amenities: str   = "",
    admin_status: str = "approved",
    builder_id: int  = 0,
    status: str      = "Available",
    image_url: str   = "",
    **_extra,
) -> Dict[str, Any]:
    """
    Return the metadata dict that gets stored alongside a vector in Pinecone.
    Every field here can be used in metadata filters at query time.
    """
    return {
        "title":        title        or "",
        "location":     location     or "",
        "price":        float(price),
        "bedrooms":     int(bedrooms),
        "bathrooms":    int(bathrooms),
        "amenities":    amenities    or "",
        "admin_status": admin_status or "pending",
        "builder_id":   int(builder_id),
        "status":       status       or "Available",
        "image_url":    image_url    or "",
    }


# Upsert (text index)

def upsert_property_embedding( #stores text embedding vector in Pinecone text index, returns True on success
    property_id: int,
    embedding: List[float],
    metadata: Dict[str, Any],
) -> bool:
    """Store/update a text embedding vector in Pinecone. Returns True on success."""
    _, index = get_pinecone("text")
    if index is None:
        return False
    try:
        index.upsert(vectors=[(str(property_id), embedding, metadata)])
        logger.debug("Upserted text vector for property %d.", property_id)
        return True
    except Exception as exc:
        logger.error("Failed to upsert text vector for property %d: %s", property_id, exc)
        return False

# Upsert (image index)

def upsert_image_embedding(
    property_id: int,
    image_embedding: List[float],
    metadata: Dict[str, Any],
) -> bool:
    """Store a CLIP image embedding in the dedicated image index."""
    _, index = get_pinecone("image")
    if index is None:
        return False
    try:
        index.upsert(
            vectors=[(str(property_id), image_embedding, metadata)]
        )
        logger.debug("Upserted image vector for property %d.", property_id)
        return True
    except Exception as exc:
        logger.error("Failed to upsert image vector for property %d: %s", property_id, exc)
        return False

# Delete


def delete_property_embedding(property_id: int) -> bool: #delete for both image and text indexes, returns True if successful
    """Remove vectors from both text and image indexes."""
    _, t_index = get_pinecone("text")
    _, i_index = get_pinecone("image")
    
    success = True
    if t_index:
        try:
            t_index.delete(ids=[str(property_id)])
            logger.info("Deleted text Pinecone vector for property %d.", property_id)
        except Exception as exc:
            logger.error("Failed to delete text Pinecone vector for property %d: %s", property_id, exc)
            success = False
            
    if i_index:
        try:
            i_index.delete(ids=[str(property_id)])
            logger.info("Deleted image Pinecone vector for property %d.", property_id)
        except Exception as exc:
            logger.error("Failed to delete image Pinecone vector for property %d: %s", property_id, exc)
            success = False
            
    return success


# Query — text index with optional metadata filters

def query_properties( #basic search with just embedding, no filters, returns Pinecone match objects
    query_embedding: List[float],
    top_k: int = 10,
) -> list:
    """Simple text-index query (no filters). Returns Pinecone match objects."""
    _, index = get_pinecone("text")
    if index is None:
        return []
    try:
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
        )
        return results.matches
    except Exception as exc:
        logger.error("Pinecone text query failed: %s", exc)
        return []


def query_properties_with_filter( #search with embedding and server-side filters (price range, bedrooms, location, amenities), returns Pinecone match objects
    query_embedding: List[float],
    top_k: int = 10,
    location: Optional[str]  = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int]   = None,
    amenities: Optional[str]  = None,
    admin_status: str         = "approved",
) -> list:
    """
    Vector search with Pinecone server-side metadata filters (on text index).
    Only approved properties are returned unless overridden.
    """
    _, index = get_pinecone("text")
    if index is None:
        return []

    # Build filter dict — only add clauses for provided values
    filter_dict: Dict[str, Any] = {"admin_status": {"$eq": admin_status}}

    if min_price is not None and max_price is not None:
        filter_dict["price"] = {"$gte": float(min_price), "$lte": float(max_price)}
    elif min_price is not None:
        filter_dict["price"] = {"$gte": float(min_price)}
    elif max_price is not None:
        filter_dict["price"] = {"$lte": float(max_price)}

    if bedrooms is not None:
        filter_dict["bedrooms"] = {"$eq": int(bedrooms)}

    try:
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict,
        )
        matches = results.matches

        # Post-filter for location / amenities (case-insensitive substring)
        if location:
            loc_lower = location.lower()
            matches = [
                m for m in matches
                if loc_lower in (m.metadata.get("location") or "").lower()
            ]
        if amenities:
            am_lower = amenities.lower()
            matches = [
                m for m in matches
                if am_lower in (m.metadata.get("amenities") or "").lower()
            ]

        return matches

    except Exception as exc:
        logger.error("Pinecone filtered query failed: %s", exc)
        return []



# Query — image index

def query_by_image(
    image_or_text_embedding: List[float],
    top_k: int = 10,
) -> list:
    """Query the image index with a CLIP embedding (from image or text)."""
    _, index = get_pinecone("image")
    if index is None:
        return []
    try:
        results = index.query(
            vector=image_or_text_embedding,
            top_k=top_k,
            include_metadata=True
        )
        return results.matches
    except Exception as exc:
        logger.error("Pinecone image query failed: %s", exc)
        return []

