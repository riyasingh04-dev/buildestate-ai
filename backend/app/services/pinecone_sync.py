"""
pinecone_sync.py
────────────────
Shared helpers used by both:
  • app/routes/property.py  (real-time, triggered on write operations)
  • app/services/scheduler.py  (batch, periodic background job)

Call `sync_property_to_pinecone` after a create/update,
and `remove_property_from_pinecone` after a delete.
"""
#This file handles sync between your DB and Pinecone,It is used in:✅ Real-time (when property is created/updated/deleted)✅ Background scheduler (periodic sync)
# Two main fuinction 1. sync_property_to_pinecone: Generate (or reuse cached) embedding for a property, upsert to Pinecone, set pinecone_synced = True, and persist. Returns True on success, False on any Pinecone failure.
# 2. remove_property_from_pinecone: Delete vectors (text + image) for a property from Pinecone. Call this BEFORE the DB row is deleted. Returns True on success,
import json
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.models.property import Property
from app.utils.embeddings import (
    get_embedding,
    get_image_embedding,
    format_property_for_embedding,
)
from app.utils.pinecone_utils import (
    build_metadata,
    upsert_property_embedding,
    upsert_image_embedding,
    delete_property_embedding,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Sync a single property to Pinecone (text + optional image)
# ---------------------------------------------------------------------------

def sync_property_to_pinecone(prop: Property, db: Session) -> bool:
    """
    Generate (or reuse cached) embedding for `prop`, upsert to Pinecone,
    set pinecone_synced = True, and persist.

    Returns True on success, False on any Pinecone failure.
    """
    try:
        # ── Text embedding ─────────────────────────────────────────────────
        text = format_property_for_embedding(
            title       = prop.title        or "",
            description = prop.description  or "",
            amenities   = prop.amenities    or "",
            location    = prop.location     or "",
            bedrooms    = prop.bedrooms     or 0,
            bathrooms   = prop.bathrooms    or 0,
            price       = prop.price        or 0.0,
            status      = prop.status       or "",
        )
        text_embedding = get_embedding(text)

        if not text_embedding:
            logger.warning("Empty text embedding for property %d — skipping.", prop.id)
            return False

        # Cache in DB so bulk script doesn't re-embed
        prop.embedding_data = json.dumps(text_embedding)

        # ── Build rich metadata ────────────────────────────────────────────
        meta = build_metadata(
            title        = prop.title        or "",
            location     = prop.location     or "",
            price        = prop.price        or 0.0,
            bedrooms     = prop.bedrooms     or 0,
            bathrooms    = prop.bathrooms    or 0,
            amenities    = prop.amenities    or "",
            admin_status = prop.admin_status or "pending",
            builder_id   = prop.builder_id   or 0,
            status       = prop.status       or "Available",
            image_url    = prop.image_url    or "",
        )

        # ── Upsert text vector ─────────────────────────────────────────────
        text_ok = upsert_property_embedding(prop.id, text_embedding, meta)

        # ── Image embedding (best-effort, non-blocking) ────────────────────
        if prop.image_url:
            image_embedding = get_image_embedding(prop.image_url)
            if image_embedding:
                upsert_image_embedding(prop.id, image_embedding, meta)

        # ── Mark as synced ─────────────────────────────────────────────────
        if text_ok:
            prop.pinecone_synced = True
            db.add(prop)
            db.commit()
            logger.info("Synced property %d to Pinecone.", prop.id)
            return True
        else:
            return False

    except Exception as exc:
        logger.error("sync_property_to_pinecone(%d) failed: %s", prop.id, exc)
        db.rollback()
        return False


# ---------------------------------------------------------------------------
# Remove a property from Pinecone
# ---------------------------------------------------------------------------

def remove_property_from_pinecone(property_id: int) -> bool:
    """
    Delete vectors (text + image) for a property from Pinecone.
    Call this BEFORE the DB row is deleted.
    """
    try:
        ok = delete_property_embedding(property_id)
        if ok:
            logger.info("Removed property %d from Pinecone.", property_id)
        return ok
    except Exception as exc:
        logger.error("remove_property_from_pinecone(%d) failed: %s", property_id, exc)
        return False
