"""Auth helper functions for tests."""

from httpx import AsyncClient, Cookies

from app.core.security import create_access_token


REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
STUDENT_LOGIN_URL = "/api/v1/auth/student-login"
REFRESH_URL = "/api/v1/auth/refresh"
LOGOUT_URL = "/api/v1/auth/logout"
VERIFY_EMAIL_URL = "/api/v1/auth/verify-email"
RESEND_VERIFICATION_URL = "/api/v1/auth/resend-verification"
REQUEST_PASSWORD_RESET_URL = "/api/v1/auth/request-password-reset"
RESET_PASSWORD_URL = "/api/v1/auth/reset-password"
CSRF_TOKEN_URL = "/api/v1/auth/csrf-token"
WS_TOKEN_URL = "/api/v1/auth/ws-token"

CSRF_VALUE = "test-csrf-token-for-testing"


def make_auth_headers(user_id: int) -> dict[str, str]:
    """Create Authorization header with a valid JWT for the given user."""
    token = create_access_token(subject=str(user_id))
    return {"Authorization": f"Bearer {token}"}


def make_auth_cookies(user_id: int, role_prefix: str = "teacher_") -> dict[str, str]:
    """Create auth cookies dict for the given user."""
    token = create_access_token(subject=str(user_id))
    return {f"{role_prefix}access_token": token}


def csrf_headers_and_cookies() -> tuple[dict[str, str], dict[str, str]]:
    """Return CSRF header and cookie pair for POST requests."""
    headers = {"X-CSRF-Token": CSRF_VALUE}
    cookies = {"csrf_token": CSRF_VALUE}
    return headers, cookies


def _set_client_cookies(client: AsyncClient, cookies: dict[str, str]):
    """Set cookies at the client level so they survive redirects."""
    for name, value in cookies.items():
        client.cookies.set(name, value)


def _clear_client_cookies(client: AsyncClient, cookie_names: list[str]):
    """Remove cookies from the client level."""
    for name in cookie_names:
        client.cookies.delete(name, domain=None, path=None)


async def authenticated_request(
    client: AsyncClient,
    method: str,
    url: str,
    user_id: int,
    role_prefix: str = "teacher_",
    **kwargs,
):
    """Make an authenticated request with proper cookies and CSRF token.

    Cookies are set at the client level so they survive any 307 redirects.
    """
    auth_cookies = make_auth_cookies(user_id, role_prefix)
    csrf_cookies = {"csrf_token": CSRF_VALUE}
    all_cookies = {**auth_cookies, **csrf_cookies}

    existing_cookies = kwargs.pop("cookies", {})
    all_cookies.update(existing_cookies)

    headers = kwargs.pop("headers", {})
    headers["X-CSRF-Token"] = CSRF_VALUE

    # Set cookies on client level (survives redirects)
    _set_client_cookies(client, all_cookies)
    try:
        return await getattr(client, method)(url, headers=headers, **kwargs)
    finally:
        _clear_client_cookies(client, list(all_cookies.keys()))


async def auth_get(client: AsyncClient, url: str, user_id: int, **kwargs):
    """Authenticated GET (no CSRF needed for GET)."""
    auth_cookies = make_auth_cookies(user_id)
    existing_cookies = kwargs.pop("cookies", {})
    auth_cookies.update(existing_cookies)

    _set_client_cookies(client, auth_cookies)
    try:
        return await client.get(url, **kwargs)
    finally:
        _clear_client_cookies(client, list(auth_cookies.keys()))


async def auth_post(client: AsyncClient, url: str, user_id: int, **kwargs):
    return await authenticated_request(client, "post", url, user_id, **kwargs)


async def auth_put(client: AsyncClient, url: str, user_id: int, **kwargs):
    return await authenticated_request(client, "put", url, user_id, **kwargs)


async def auth_patch(client: AsyncClient, url: str, user_id: int, **kwargs):
    return await authenticated_request(client, "patch", url, user_id, **kwargs)


async def auth_delete(client: AsyncClient, url: str, user_id: int, **kwargs):
    return await authenticated_request(client, "delete", url, user_id, **kwargs)
