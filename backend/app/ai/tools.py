"""
tools.py — LangChain tool definitions for the real estate agent.

Query flow (vector-first):
  User Input
      ↓
  get_embedding(query)                    ← 384-dim text embedding
      ↓
  query_properties_with_filter(...)       ← Pinecone: semantic + metadata filters
      ↓
  DB fetch by ID set  (single IN query)   ← only approved, from real DB
      ↓
  Re-rank by Pinecone score
      ↓
  Return top-K to LLM
"""

import logging
from typing import Any, Dict, List, Optional

from langchain.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models import property as _prop_module  # ensure model is registered
from app.models.property import Property
from app.utils.embeddings import get_embedding
from app.utils.pinecone_utils import query_properties_with_filter, query_properties

logger = logging.getLogger(__name__)


# Input schema
class SearchInput(BaseModel):
    query: Optional[str] = Field(
        None,
        description=(
            "Natural language description for semantic search "
            "(e.g. 'serene hilltop villa', 'peaceful getaway near nature')."
        ),
    )
    location: Optional[str] = Field(
        None, description="City, area, or neighbourhood name (e.g. 'Mumbai', 'Bandra')."
    )
    min_price: Optional[int] = Field(
        None, description="Minimum budget in INR as a raw integer (e.g. 5000000 for 50 lakhs)."
    )
    max_price: Optional[int] = Field(
        None, description="Maximum budget in INR as a raw integer (e.g. 10000000 for 1 crore)."
    )
    bhk: Optional[int] = Field(
        None, description="Number of bedrooms required (integer, e.g. 2 for 2BHK)."
    )
    amenities: Optional[str] = Field(
        None, description="Specific features required (e.g. 'pool', 'gym', 'parking')."
    )
    image_url: Optional[str] = Field(
        None, description="Public URL of a reference property image for visual similarity search."
    )
    top_k: int = Field(5, description="Maximum number of results to return (default 5).")


# Tool
@tool(args_schema=SearchInput)
def search_properties(
    query: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    bhk: Optional[int] = None,
    amenities: Optional[str] = None,
    image_url: Optional[str] = None,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """Search for real estate properties using semantic vector search with optional filters."""

    # ── Type coercion for numeric fields (in case LLM outputs them as strings)
    if isinstance(bhk, str):
        try:
            bhk = int(bhk)
        except ValueError:
            bhk = None

    if isinstance(top_k, str):
        try:
            top_k = int(top_k)
        except ValueError:
            top_k = 5

    # ── Determine search embedding 
    # Priority: explicit text query > image query > location/amenities fallback
    query_embedding: List[float] = []

    if query:
        query_embedding = get_embedding(query)
    elif image_url:
        # Use CLIP text path for image description (image download handled in multimodal route)
        from app.utils.embeddings import get_image_embedding_from_text
        query_embedding = get_image_embedding_from_text(image_url)
    else:
        # No semantic query — build a synthetic embedding from filter terms so
        # Pinecone can still rank results meaningfully
        filter_text_parts = []
        if location:
            filter_text_parts.append(location)
        if amenities:
            filter_text_parts.append(amenities)
        if bhk:
            filter_text_parts.append(f"{bhk} bedroom")
        if filter_text_parts:
            query_embedding = get_embedding(" ".join(filter_text_parts))

    # ── Vector search in Pinecone (with server-side metadata filters)
    pinecone_ids: List[int] = []
    score_map: Dict[int, float] = {}

    if query_embedding:
        matches = query_properties_with_filter(
            query_embedding=query_embedding,
            top_k=max(top_k * 3, 20),   # over-fetch for re-ranking
            location=location,
            min_price=float(min_price) if min_price else None,
            max_price=float(max_price) if max_price else None,
            bedrooms=bhk,
            amenities=amenities,
            admin_status="approved",
        )
        pinecone_ids = [int(m.id) for m in matches]
        score_map    = {int(m.id): m.score for m in matches}

    # ── DB hydration 
    db: Session = SessionLocal()
    try:
        if pinecone_ids:
            # Single IN query — pull full property rows for the matched IDs
            properties = (
                db.query(Property)
                .filter(
                    Property.id.in_(pinecone_ids),
                    Property.admin_status == "approved",
                )
                .all()
            )
            # Re-rank by Pinecone relevance score (highest first)
            properties.sort(key=lambda p: score_map.get(p.id, 0), reverse=True)
            results = properties[:top_k]

        else:
            # No embedding available — fall back to plain SQL filter
            logger.warning("No query embedding — falling back to SQL filter.")
            q = db.query(Property).filter(Property.admin_status == "approved")
            if location:
                q = q.filter(Property.location.ilike(f"%{location}%"))
            if min_price:
                q = q.filter(Property.price >= min_price)
            if max_price:
                q = q.filter(Property.price <= max_price)
            if bhk:
                q = q.filter(Property.bedrooms == bhk)
            if amenities:
                q = q.filter(Property.amenities.ilike(f"%{amenities}%"))
            results = q.limit(top_k).all()

    finally:
        db.close()

    # ── Serialise results to list of dicts for LLM response
    return [
        {
            "id":        p.id,
            "title":     p.title,
            "location":  p.location,
            "price":     p.price,
            "image_url": p.image_url,
            "bedrooms":  p.bedrooms,
            "bathrooms": p.bathrooms,
            "area":      p.area,
            "amenities": p.amenities,
            "status":    p.status,
            "score":     round(score_map.get(p.id, 0.0), 4),
        }
        for p in results
    ]