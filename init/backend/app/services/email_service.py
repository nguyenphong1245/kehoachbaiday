import logging
import re
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("app.email")

_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def _sanitize_header(value: str) -> str:
    """Strip CR/LF để chống email header injection."""
    return value.replace("\r", "").replace("\n", "").strip()


def _is_valid_email(email: str) -> bool:
    return bool(_EMAIL_RE.match(email))


def _log_email(subject: str, recipient: str, body: str) -> None:
    settings = get_settings()
    logger.info(
        "Email (console fallback) To=%s Subject=%s FrontendURL=%s\n%s",
        recipient, subject, settings.frontend_base_url, body,
    )


def send_email(subject: str, recipient: str, body: str) -> None:
    subject = _sanitize_header(subject)
    recipient = _sanitize_header(recipient)

    if not _is_valid_email(recipient):
        logger.warning("email.invalid_recipient recipient=%s", recipient)
        return

    settings = get_settings()

    if not settings.smtp_host or settings.smtp_port is None or not settings.smtp_default_sender:
        _log_email(subject, recipient, body)
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_default_sender
    message["To"] = recipient
    message.set_content(body)

    try:
        # Port 587 dng STARTTLS, Port 465 dng SSL
        if settings.smtp_use_ssl or settings.smtp_port == 465:
            server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=15)
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15)
            if settings.smtp_use_tls or settings.smtp_port == 587:
                server.starttls()
        
        with server:
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
            logger.info("Email sent successfully to %s", recipient)
    except Exception as exc:  # pragma: no cover - depends on external SMTP service
        logger.warning("Email delivery failed (%r). Falling back to console output.", exc)
        _log_email(subject, recipient, body)


def send_verification_email(email: str, token: str) -> None:
    settings = get_settings()
    body = (
        "Thank you for signing up!\n\n"
        f"Your verification code is: {token}\n\n"
        "Enter this code to verify your email address.\n"
        f"This code will expire in {settings.email_verification_token_expire_minutes} minutes.\n"
    )
    send_email("Verify your account", email, body)


def send_password_reset_email(email: str, token: str) -> None:
    settings = get_settings()
    body = (
        "You requested a password reset.\n\n"
        f"Your reset code is: {token}\n\n"
        "Enter this code to reset your password.\n"
        f"This code will expire in {settings.password_reset_token_expire_minutes} minutes.\n"
        "If you did not request this, please ignore this email.\n"
    )
    send_email("Reset your password", email, body)
