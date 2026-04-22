"""
scheduler.py
────────────
APScheduler background job that keeps Pinecone in sync with the main database.

Job runs every SYNC_INTERVAL_MINUTES (default: 15).
On each run it:
  1. Fetches properties where pinecone_synced = False   (newly created)
  2. Fetches properties where updated_at > last_run_time (recently edited)
  3. Generates embeddings and upserts into Pinecone
  4. Marks each property pinecone_synced = True

This ensures Pinecone always has fresh data even if a real-time sync failed.
"""

import logging #Used to print structured logs (better than print)
import os
from datetime import datetime, timedelta, timezone #used for current time, comparing timestamps
from typing import Optional #used for type hinting (e.g. Optional[datetime])

from apscheduler.schedulers.background import BackgroundScheduler #Runs tasks in background (non-blocking)
from apscheduler.triggers.interval import IntervalTrigger #Defines how often the job runs (e.g. every 15 minutes)

from app.db.database import SessionLocal #create DB connections
from app.models.property import Property #Your database table model for properties
from app.services.pinecone_sync import sync_property_to_pinecone #function that create embeddings and upsert to Pinecone

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SYNC_INTERVAL_MINUTES: int = int(os.getenv("SYNC_INTERVAL_MINUTES", "15"))

# ---------------------------------------------------------------------------
# Internal state
# ---------------------------------------------------------------------------
_scheduler: Optional[BackgroundScheduler] = None
_last_run: Optional[datetime] = None   # UTC timestamp of the previous successful run


# ---------------------------------------------------------------------------
# The job itself
# ---------------------------------------------------------------------------

def _sync_job() -> None:
    """
    Delta sync: only process properties that are new or changed since last run.
    """
    global _last_run
    job_start = datetime.now(timezone.utc)
    logger.info("[Scheduler] Starting Pinecone delta sync at %s", job_start.isoformat())

    db = SessionLocal()
    synced = 0 #successful sync count
    errors = 0#failed sync count

    try:
        # ── 1. Properties never synced ────────────────────────────────────
        unsynced = db.query(Property).filter(
            Property.pinecone_synced == False  # noqa: E712
        ).all()

        # ── 2. Properties updated since last run (catches edits that slipped past real-time sync)
        updated = []
        if _last_run is not None:
            updated = db.query(Property).filter(
                Property.updated_at > _last_run,
                Property.pinecone_synced == True  # already in Pinecone but stale
            ).all()

        to_sync = {p.id: p for p in unsynced + updated}   # deduplicate by ID (Merge both lists use dictionary to remove duplicates , key = property id {unique}, value = property object)

        logger.info(
            "[Scheduler] %d unsynced + %d updated = %d properties to process.",
            len(unsynced), len(updated), len(to_sync),
        )

        for prop in to_sync.values():
            ok = sync_property_to_pinecone(prop, db)
            if ok:
                synced += 1
            else:
                errors += 1

        _last_run = job_start
        logger.info(
            "[Scheduler] Done — synced=%d errors=%d", synced, errors
        )

    except Exception as exc:
        logger.exception("[Scheduler] Unexpected error: %s", exc)
    finally:
        db.close()

# Lifecycle helpers called from main.py
# start scheduler on app startup, stop on shutdown
def start_scheduler() -> None:
    """Start the APScheduler background scheduler."""
    global _scheduler
    if _scheduler is not None and _scheduler.running: #Prevent duplicate scheduler
        return

    _scheduler = BackgroundScheduler(timezone="UTC") #create scheduler instance with UTC timezone
    _scheduler.add_job( #add job to scheduler
        func=_sync_job, #the function to run
        trigger=IntervalTrigger(minutes=SYNC_INTERVAL_MINUTES), #run every SYNC_INTERVAL_MINUTES
        id="pinecone_sync", #unique job id
        name="Pinecone delta sync",
        replace_existing=True, #Replace if already existsḍ
        max_instances=1,       # prevent overlapping runs
        misfire_grace_time=60, # skip instead of pile up if delayed
    )
    _scheduler.start()
    logger.info(
        "[Scheduler] Started — will sync Pinecone every %d minute(s).",
        SYNC_INTERVAL_MINUTES,
    )


def stop_scheduler() -> None:
    """Gracefully stop the scheduler on app shutdown."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[Scheduler] Stopped.")
