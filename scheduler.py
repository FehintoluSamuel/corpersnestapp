"""
scheduler.py

Background job scheduler using APScheduler.
Runs a nightly job at midnight to auto-promote users whose NYSC
service stage has changed since their last login.

Install dependency:
    pip install apscheduler

Mount in main.py:
    from scheduler import start_scheduler
    start_scheduler()
"""
from models.database_model import Listing
from dependencies import ListingStatus
from datetime import datetime, timezone, timedelta


import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from database import SessionLocal
from models.database_model import User
from dependencies import Role, Status
from utils.nysc import derive_role

logger = logging.getLogger(__name__)


def promote_users() -> None:
    """
    Iterates all corper users with a state code and recalculates their role.
    Only commits if a role actually changed to avoid unnecessary DB writes.

    Skips: landlords, admins, suspended users, and users with no state code.
    """
    db = SessionLocal()
    updated_count = 0

    try:
        # Only query users whose role can auto-progress
        eligible_roles = [
            Role.pcm,
            Role.incoming_corper,
            Role.outgoing_corper,
        ]

        users = (
            db.query(User)
            .filter(
                User.role.in_(eligible_roles),
                User.status != Status.suspended,
            )
            .all()
        )

        for user in users:
            new_role = derive_role(user)
            if user.role != new_role:
                logger.info(
                    f"Promoting user {user.id} ({user.full_name}): "
                    f"{user.role} → {new_role}"
                )
                user.role = new_role
                updated_count += 1

        if updated_count > 0:
            db.commit()

        logger.info(f"Nightly promotion complete. {updated_count} user(s) updated.")

    except Exception as e:
        db.rollback()
        logger.error(f"Nightly promotion job failed: {e}")

    finally:
        db.close()
    
    
def expire_old_listings() -> None:
    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(days=90)
        expired = (
            db.query(Listing)
            .filter(
                Listing.status     == ListingStatus.active,
                Listing.created_at <= cutoff,
            )
            .all()
        )
        for listing in expired:
            listing.status = ListingStatus.inactive
        if expired:
            db.commit()
        logger.info(f"Expired {len(expired)} old listing(s).")
    except Exception as e:
        db.rollback()
        logger.error(f"Listing expiry job failed: {e}")
    finally:
        db.close()



def start_scheduler() -> None:
    """
    Initialises and starts the background scheduler.
    Call this once from main.py on app startup.
    """
    scheduler = BackgroundScheduler(timezone="Africa/Lagos")

    scheduler.add_job(
        func    = expire_old_listings,
        trigger = CronTrigger(hour=0, minute=30),  # 12:30 AM WAT
        id      = "listing_expiry",
        name    = "Auto-expire old listings",
        replace_existing = True,
)

    scheduler.start()
    logger.info("Scheduler started — nightly role promotion active.") 
    
