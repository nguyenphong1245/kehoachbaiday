import smtplib
from email.message import EmailMessage

from app.core.config import get_settings


def _log_email(subject: str, recipient: str, body: str) -> None:
    settings = get_settings()
    print("-- Email Notification (console fallback) --")
    print(f"To: {recipient}")
    print(f"Subject: {subject}")
    print(body)
    print(f"(Configure SMTP settings to send real emails; frontend base URL: {settings.frontend_base_url})")


def send_email(subject: str, recipient: str, body: str) -> None:
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
        smtp_factory = smtplib.SMTP_SSL if settings.smtp_use_ssl else smtplib.SMTP
        with smtp_factory(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            if settings.smtp_use_tls and not settings.smtp_use_ssl:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except Exception as exc:  # pragma: no cover - depends on external SMTP service
        print(f"Email delivery failed ({exc!r}). Falling back to console output.")
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
        "We received a request to reset your password.\n\n"
        f"Your password reset code is: {token}\n\n"
        "Enter this code to reset your password.\n"
        f"This code will expire in {settings.password_reset_token_expire_minutes} minutes.\n\n"
        "If you did not request this, you can ignore this message."
    )
    send_email("Reset your password", email, body)
