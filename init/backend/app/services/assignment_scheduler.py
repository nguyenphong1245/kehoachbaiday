"""
Assignment Scheduler Service - Auto-submit and Peer Review Activation
"""
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.triggers.date import DateTrigger
import httpx
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Global scheduler instance
scheduler: AsyncIOScheduler = None


def init_scheduler():
    """Initialize scheduler on app startup"""
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler already initialized")
        return scheduler

    try:
        # Convert async database URL to sync URL for SQLAlchemyJobStore
        # asyncpg -> psycopg2 (or just remove asyncpg part)
        sync_db_url = settings.sql_database_url.replace("+asyncpg", "")

        # Create job store with database persistence
        jobstores = {
            'default': SQLAlchemyJobStore(url=sync_db_url)
        }

        scheduler = AsyncIOScheduler(jobstores=jobstores)
        scheduler.start()

        logger.info("Assignment scheduler initialized successfully")
        return scheduler
    except Exception as e:
        logger.error(f"Failed to initialize scheduler: {e}")
        # Don't raise - let the app start without scheduler
        # Use memory-based scheduler as fallback
        logger.warning("Falling back to memory-based scheduler")
        scheduler = AsyncIOScheduler()
        scheduler.start()
        return scheduler


def get_scheduler() -> AsyncIOScheduler | None:
    """Get the global scheduler instance, or None if not available"""
    return scheduler


async def trigger_auto_submit(assignment_id: int):
    """
    Background job: Auto-submit all in-progress sessions when due_date expires.
    Makes HTTP request to internal endpoint.
    """
    try:
        logger.info(f"Triggering auto-submit for assignment {assignment_id}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://{settings.backend_host}:{settings.backend_port}/api/v1/student/assignments/{assignment_id}/auto-submit",
                params={"api_key": settings.internal_api_key},
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                logger.info(f"Auto-submit successful for assignment {assignment_id}: {result}")
            else:
                logger.error(f"Auto-submit failed with status {response.status_code}: {response.text}")

    except Exception as e:
        logger.error(f"Error in trigger_auto_submit for assignment {assignment_id}: {e}")


async def trigger_peer_review_activation(assignment_id: int):
    """
    Background job: Auto-activate peer review when peer_review_start_time is reached.
    Makes HTTP request to internal endpoint.
    """
    try:
        logger.info(f"Triggering peer review activation for assignment {assignment_id}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://{settings.backend_host}:{settings.backend_port}/api/v1/peer-review/assignments/{assignment_id}/auto-activate",
                params={"api_key": settings.internal_api_key},
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                logger.info(f"Peer review activation successful for assignment {assignment_id}: {result}")
            else:
                logger.error(f"Peer review activation failed with status {response.status_code}: {response.text}")

    except Exception as e:
        logger.error(f"Error in trigger_peer_review_activation for assignment {assignment_id}: {e}")


async def schedule_auto_submit(assignment_id: int, due_date: datetime):
    """
    Schedule auto-submit job for an assignment.

    Args:
        assignment_id: The assignment ID
        due_date: When to auto-submit (timezone-aware datetime)
    """
    try:
        sched = get_scheduler()
        if sched is None:
            logger.warning(f"Scheduler not available, cannot schedule auto-submit for assignment {assignment_id}")
            return

        job_id = f"auto_submit_{assignment_id}"

        # Remove existing job if any
        existing_job = sched.get_job(job_id)
        if existing_job:
            existing_job.remove()
            logger.info(f"Removed existing auto-submit job for assignment {assignment_id}")

        # Schedule new job
        sched.add_job(
            func=trigger_auto_submit,
            trigger=DateTrigger(run_date=due_date),
            args=[assignment_id],
            id=job_id,
            replace_existing=True,
            misfire_grace_time=300  # Allow 5 minutes grace if server was down
        )

        logger.info(f"Scheduled auto-submit for assignment {assignment_id} at {due_date}")

    except Exception as e:
        logger.error(f"Failed to schedule auto-submit for assignment {assignment_id}: {e}")
        # Don't raise - scheduling failure shouldn't prevent assignment creation


async def schedule_peer_review_activation(assignment_id: int, start_time: datetime):
    """
    Schedule peer review activation job for an assignment.

    Args:
        assignment_id: The assignment ID
        start_time: When to activate peer review (timezone-aware datetime)
    """
    try:
        sched = get_scheduler()
        if sched is None:
            logger.warning(f"Scheduler not available, cannot schedule peer review activation for assignment {assignment_id}")
            return

        job_id = f"peer_review_{assignment_id}"

        # Remove existing job if any
        existing_job = sched.get_job(job_id)
        if existing_job:
            existing_job.remove()
            logger.info(f"Removed existing peer review job for assignment {assignment_id}")

        # Schedule new job
        sched.add_job(
            func=trigger_peer_review_activation,
            trigger=DateTrigger(run_date=start_time),
            args=[assignment_id],
            id=job_id,
            replace_existing=True,
            misfire_grace_time=300  # Allow 5 minutes grace if server was down
        )

        logger.info(f"Scheduled peer review activation for assignment {assignment_id} at {start_time}")

    except Exception as e:
        logger.error(f"Failed to schedule peer review activation for assignment {assignment_id}: {e}")
        # Don't raise - scheduling failure shouldn't prevent assignment creation


async def cancel_assignment_jobs(assignment_id: int):
    """
    Cancel all scheduled jobs for an assignment (e.g., when assignment is deleted).

    Args:
        assignment_id: The assignment ID
    """
    try:
        sched = get_scheduler()
        if sched is None:
            logger.warning(f"Scheduler not available, cannot cancel jobs for assignment {assignment_id}")
            return

        # Cancel auto-submit job
        auto_submit_job = sched.get_job(f"auto_submit_{assignment_id}")
        if auto_submit_job:
            auto_submit_job.remove()
            logger.info(f"Cancelled auto-submit job for assignment {assignment_id}")

        # Cancel peer review job
        peer_review_job = sched.get_job(f"peer_review_{assignment_id}")
        if peer_review_job:
            peer_review_job.remove()
            logger.info(f"Cancelled peer review job for assignment {assignment_id}")

    except Exception as e:
        logger.error(f"Failed to cancel jobs for assignment {assignment_id}: {e}")


def shutdown_scheduler():
    """Shutdown the scheduler gracefully"""
    global scheduler

    if scheduler is not None:
        scheduler.shutdown(wait=True)
        logger.info("Scheduler shut down successfully")
        scheduler = None
