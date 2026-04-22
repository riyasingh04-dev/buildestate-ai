"""
search.py — Multimodal search endpoint.

POST /search/multimodal
  Accepts: { "text": "...", "image_url": "..." }
  At least one of text or image_url must be provided.

Flow:
  text   → 384-dim MiniLM embedding  → Pinecone default namespace
  image  → 512-dim CLIP embedding    → Pinecone "images" namespace
  Both   → results are merged and re-ranked by score
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.property import Property
from app.utils.embeddings import get_embedding, get_image_embedding, get_image_embedding_from_text
from app.utils.pinecone_utils import query_properties_with_filter, query_by_image

logger = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response schemas
# ─────────────────────────────────────────────────────────────────────────────

class MultimodalSearchRequest(BaseModel):
    text: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bedrooms: Optional[int] = None
    amenities: Optional[str] = None
    top_k: int = 5


class PropertyResult(BaseModel):
    id: int
    title: str
    location: str
    price: float
    image_url: Optional[str]
    bedrooms: int
    bathrooms: int
    area: float
    amenities: Optional[str]
    score: float
    match_type: str   # "text", "image", or "both"


class MultimodalSearchResponse(BaseModel):
    results: List[PropertyResult]
    text_matched: int
    image_matched: int
    total: int


# ─────────────────────────────────────────────────────────────────────────────
# Helper — hydrate property IDs from DB
# ─────────────────────────────────────────────────────────────────────────────

def _hydrate(
    ids: List[int],
    score_map: Dict[int, float],
    match_type_map: Dict[int, str],
    db: Session,
    top_k: int,
) -> List[Dict[str, Any]]:
    """Fetch Property rows from DB for the given IDs and attach scores."""
    if not ids:
        return []

    props = (
        db.query(Property)
        .filter(
            Property.id.in_(ids),
            Property.admin_status == "approved",
        )
        .all()
    )
    props.sort(key=lambda p: score_map.get(p.id, 0), reverse=True)

    return [
        {
            "id":         p.id,
            "title":      p.title,
            "location":   p.location,
            "price":      p.price,
            "image_url":  p.image_url,
            "bedrooms":   p.bedrooms,
            "bathrooms":  p.bathrooms,
            "area":       p.area,
            "amenities":  p.amenities,
            "score":      round(score_map.get(p.id, 0.0), 4),
            "match_type": match_type_map.get(p.id, "text"),
        }
        for p in props[:top_k]
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/multimodal", response_model=MultimodalSearchResponse)
def multimodal_search(req: MultimodalSearchRequest):
    """
    Search properties using text, image, or both.
    Text uses the 384-dim MiniLM index (default namespace).
    Images use the 512-dim CLIP index (images namespace).
    """
    if not req.text and not req.image_url:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one of 'text' or 'image_url'.",
        )

    # ── Collect results from both modalities ──────────────────────────────
    score_map:      Dict[int, float] = {}
    match_type_map: Dict[int, str]   = {}
    text_ids:  List[int] = []
    image_ids: List[int] = []

    # 1. Text search (MiniLM, 384-dim)
    if req.text:
        text_emb = get_embedding(req.text)
        if text_emb:
            text_matches = query_properties_with_filter(
                query_embedding = text_emb,
                top_k           = req.top_k * 3,
                location        = req.location,
                min_price       = req.min_price,
                max_price       = req.max_price,
                bedrooms        = req.bedrooms,
                amenities       = req.amenities,
                admin_status    = "approved",
            )
            for m in text_matches:
                pid = int(m.id)
                text_ids.append(pid)
                score_map[pid]      = m.score
                match_type_map[pid] = "text"

    # 2. Image search (CLIP, 512-dim)
    if req.image_url:
        img_emb = get_image_embedding(req.image_url)
        if img_emb:
            img_matches = query_by_image(img_emb, top_k=req.top_k * 3)
            for m in img_matches:
                pid = int(m.id)
                image_ids.append(pid)
                if pid in score_map:
                    # Both modalities matched — average and mark as "both"
                    score_map[pid]      = (score_map[pid] + m.score) / 2
                    match_type_map[pid] = "both"
                else:
                    score_map[pid]      = m.score
                    match_type_map[pid] = "image"

    # ── Merge IDs ─────────────────────────────────────────────────────────
    all_ids = list({*text_ids, *image_ids})   # deduplicated

    if not all_ids:
        return MultimodalSearchResponse(results=[], text_matched=0, image_matched=0, total=0)

    # ── Hydrate from DB ───────────────────────────────────────────────────
    db: Session = SessionLocal()
    try:
        results = _hydrate(all_ids, score_map, match_type_map, db, req.top_k)
    finally:
        db.close()

    return MultimodalSearchResponse(
        results       = [PropertyResult(**r) for r in results],
        text_matched  = len(text_ids),
        image_matched = len(image_ids),
        total         = len(results),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Simple text-only search (convenience endpoint, same as the agent tool)
# ─────────────────────────────────────────────────────────────────────────────

class TextSearchRequest(BaseModel):
    query: str
    location: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bedrooms: Optional[int] = None
    top_k: int = 5


@router.post("/text")
def text_search(req: TextSearchRequest):
    """Fast text-only semantic search endpoint."""
    emb = get_embedding(req.query)
    if not emb:
        raise HTTPException(status_code=422, detail="Could not generate embedding for query.")

    matches = query_properties_with_filter(
        query_embedding = emb,
        top_k           = req.top_k * 2,
        location        = req.location,
        min_price       = req.min_price,
        max_price       = req.max_price,
        bedrooms        = req.bedrooms,
        admin_status    = "approved",
    )

    ids       = [int(m.id) for m in matches]
    score_map = {int(m.id): m.score for m in matches}

    db: Session = SessionLocal()
    try:
        props = (
            db.query(Property)
            .filter(Property.id.in_(ids), Property.admin_status == "approved")
            .all()
        )
        props.sort(key=lambda p: score_map.get(p.id, 0), reverse=True)

        return [
            {
                "id":        p.id,
                "title":     p.title,
                "location":  p.location,
                "price":     p.price,
                "image_url": p.image_url,
                "bedrooms":  p.bedrooms,
                "amenities": p.amenities,
                "score":     round(score_map.get(p.id, 0.0), 4),
            }
            for p in props[: req.top_k]
        ]
    finally:
        db.close()
