from typing import Iterable

from app.core.logging import logger
from app.services.email_service import send_email
from app.core.config import get_settings


def notify_admin(subject: str, body: str) -> None:
    settings = get_settings()
    if not settings.notification_admin_email:
        logger.info("notify_admin.skipped", extra={"reason": "no_admin_email"})
        return
    send_email(subject=subject, recipient=settings.notification_admin_email, body=body)
    logger.info("notify_admin.sent", extra={"subject": subject, "recipient": settings.notification_admin_email})


def notify_user_emails(emails: Iterable[str], subject: str, body: str) -> None:
    for email in emails:
        send_email(subject=subject, recipient=email, body=body)
        logger.info("notify_user.sent", extra={"subject": subject, "recipient": email})
