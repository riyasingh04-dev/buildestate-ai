"""
sync_to_pinecone.py — Bulk sync script.

Run manually to (re)index all properties into Pinecone.
Skips properties already marked pinecone_synced=True unless --force is passed.

Usage:
    python sync_to_pinecone.py           # only un-synced properties
    python sync_to_pinecone.py --force   # re-sync everything
"""

import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

# Ensure app is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.db import base  # registers all ORM models (User, Property, Lead, etc.)
from app.db.database import SessionLocal
from app.models.property import Property
from app.services.pinecone_sync import sync_property_to_pinecone

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


def sync(force: bool = False) -> None:
    logger.info("=== Pinecone Bulk Sync ===")
    logger.info("Mode: %s", "FORCE (re-sync all)" if force else "DELTA (un-synced only)")

    db = SessionLocal()
    try:
        if force:
            properties = db.query(Property).all()
        else:
            properties = (
                db.query(Property)
                .filter(Property.pinecone_synced == False)  # noqa: E712
                .all()
            )

        total = len(properties)
        logger.info("Properties to sync: %d", total)

        synced = 0
        failed = 0

        for i, prop in enumerate(properties, start=1):
            ok = sync_property_to_pinecone(prop, db)
            if ok:
                synced += 1
            else:
                failed += 1
                logger.warning("Failed to sync property ID=%d (%s)", prop.id, prop.title)

            if i % 10 == 0:
                logger.info("Progress: %d / %d", i, total)

        logger.info("=== Done — synced=%d  failed=%d ===", synced, failed)

    finally:
        db.close()


if __name__ == "__main__":
    force_mode = "--force" in sys.argv
    sync(force=force_mode)
