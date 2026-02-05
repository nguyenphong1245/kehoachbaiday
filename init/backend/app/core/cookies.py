"""
Cookie management helpers for httpOnly auth tokens and CSRF protection.
"""
import secrets
from fastapi import Response
from .config import get_settings


def generate_csrf_token() -> str:
    """Generate a secure random CSRF token."""
    return secrets.token_urlsafe(32)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str, role_prefix: str = "") -> None:
    """Set httpOnly cookies for access and refresh tokens.

    Args:
        response: FastAPI Response object
        access_token: JWT access token
        refresh_token: JWT refresh token
        role_prefix: Prefix for cookie names (e.g., 'teacher_', 'student_') to enable multi-session
    """
    settings = get_settings()

    access_cookie_name = f"{role_prefix}access_token" if role_prefix else "access_token"
    refresh_cookie_name = f"{role_prefix}refresh_token" if role_prefix else "refresh_token"

    response.set_cookie(
        key=access_cookie_name,
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    response.set_cookie(
        key=refresh_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=settings.refresh_token_expire_days * 86400,
        path="/api/v1/auth",  # Only sent to auth endpoints
    )


def clear_auth_cookies(response: Response, role_prefix: str = "") -> None:
    """Remove auth cookies.

    Args:
        response: FastAPI Response object
        role_prefix: Prefix for cookie names (e.g., 'teacher_', 'student_')
    """
    settings = get_settings()

    access_cookie_name = f"{role_prefix}access_token" if role_prefix else "access_token"
    refresh_cookie_name = f"{role_prefix}refresh_token" if role_prefix else "refresh_token"

    response.delete_cookie(
        key=access_cookie_name,
        domain=settings.cookie_domain,
        path="/",
    )
    response.delete_cookie(
        key=refresh_cookie_name,
        domain=settings.cookie_domain,
        path="/api/v1/auth",
    )


def clear_all_auth_cookies(response: Response) -> None:
    """Remove all auth cookies (teacher + student + legacy)."""
    clear_auth_cookies(response, "teacher_")
    clear_auth_cookies(response, "student_")
    clear_auth_cookies(response, "")  # Legacy cookies without prefix


def set_csrf_cookie(response: Response, token: str | None = None) -> str:
    """Set CSRF token cookie (readable by JavaScript for double-submit pattern).

    Args:
        response: FastAPI Response object
        token: Optional existing token to use, or generate new one

    Returns:
        The CSRF token value
    """
    settings = get_settings()
    csrf_token = token or generate_csrf_token()

    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,  # Must be readable by JavaScript
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return csrf_token


def clear_csrf_cookie(response: Response) -> None:
    """Remove CSRF token cookie."""
    settings = get_settings()
    response.delete_cookie(
        key="csrf_token",
        domain=settings.cookie_domain,
        path="/",
    )
