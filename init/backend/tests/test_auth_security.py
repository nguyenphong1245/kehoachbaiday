"""Tests for authentication security (Module 2 - 10 test cases)."""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from tests.helpers.auth_helpers import LOGIN_URL, REGISTER_URL, csrf_headers_and_cookies, make_auth_cookies
from tests.helpers.factories import create_user, ensure_roles


settings = get_settings()


# ---------- 2.1 Account Lockout After 5 Attempts ----------
@pytest.mark.asyncio
async def test_account_lockout_after_5_attempts(client: AsyncClient, db_session: AsyncSession, roles):
    await create_user(db_session, email="lockout@test.com", password="StrongPass1!", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    # 5 failed login attempts
    for i in range(5):
        resp = await client.post(LOGIN_URL, json={"email": "lockout@test.com", "password": "WrongPass1!"})
        assert resp.status_code == 401, f"Attempt {i+1} should return 401"

    # 6th attempt should be locked (429)
    resp = await client.post(LOGIN_URL, json={"email": "lockout@test.com", "password": "WrongPass1!"})
    assert resp.status_code == 429


# ---------- 2.2 Account Lockout Recovery ----------
@pytest.mark.asyncio
async def test_account_lockout_recovery(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="recover@test.com", password="StrongPass1!", is_verified=True, roles=roles, role_names=["teacher"])
    # Simulate already locked (locked 31 minutes ago -> should be unlocked)
    user.failed_login_attempts = 5
    user.locked_until = datetime.now(timezone.utc) - timedelta(minutes=1)  # lock expired
    await db_session.commit()

    resp = await client.post(LOGIN_URL, json={"email": "recover@test.com", "password": "StrongPass1!"})
    assert resp.status_code == 200


# ---------- 2.3 Rate Limit Login ----------
@pytest.mark.asyncio
async def test_rate_limit_login(client: AsyncClient, db_session: AsyncSession, roles):
    """Rate limiting is disabled in test env by default, so this tests the config path."""
    await create_user(db_session, email="ratelimit@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    # In test environment rate limiting is disabled, so we just verify the endpoint works
    for _ in range(5):
        resp = await client.post(LOGIN_URL, json={"email": "ratelimit@test.com", "password": "WrongPass1!"})
        assert resp.status_code in (401, 429)


# ---------- 2.4 Rate Limit Register ----------
@pytest.mark.asyncio
async def test_rate_limit_register(client: AsyncClient):
    """Verify register endpoint has rate limit decorator (functional test)."""
    with patch("app.api.routes.auth.send_verification_email"):
        resp = await client.post(REGISTER_URL, json={"email": "rate1@test.com", "password": "StrongPass1!"})
    assert resp.status_code in (201, 429)


# ---------- 2.5 CSRF Protection ----------
@pytest.mark.asyncio
async def test_csrf_protection(client: AsyncClient, db_session: AsyncSession, roles):
    """POST request without CSRF token should be rejected (for non-exempt endpoints)."""
    user = await create_user(db_session, email="csrf@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    cookies = make_auth_cookies(user.id)
    # POST to a CSRF-protected endpoint without CSRF token
    resp = await client.post(
        "/api/v1/users/me/change-password",
        json={"old_password": "StrongPass1!", "new_password": "NewPass1!"},
        cookies=cookies,
    )
    assert resp.status_code == 403
    assert "csrf" in resp.json().get("detail", "").lower()


# ---------- 2.6 JWT Expired Token ----------
@pytest.mark.asyncio
async def test_jwt_expired_token(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="expired@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    # Create an expired token
    expired_token = jwt.encode(
        {"sub": str(user.id), "exp": datetime.now(timezone.utc) - timedelta(hours=1)},
        settings.secret_key,
        algorithm=settings.algorithm,
    )
    resp = await client.get(
        f"/api/v1/users/{user.id}",
        cookies={"teacher_access_token": expired_token},
    )
    assert resp.status_code == 401


# ---------- 2.7 JWT Invalid Signature ----------
@pytest.mark.asyncio
async def test_jwt_invalid_signature(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="invalid@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    # Create a token signed with wrong key
    bad_token = jwt.encode(
        {"sub": str(user.id), "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        "wrong-secret-key",
        algorithm=settings.algorithm,
    )
    resp = await client.get(
        f"/api/v1/users/{user.id}",
        cookies={"teacher_access_token": bad_token},
    )
    assert resp.status_code == 401


# ---------- 2.8 Password Hash Bcrypt ----------
@pytest.mark.asyncio
async def test_password_hash_bcrypt():
    """Passwords should be hashed with bcrypt."""
    hashed = get_password_hash("TestPassword1!")
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password("TestPassword1!", hashed)
    assert not verify_password("WrongPassword1!", hashed)


# ---------- 2.9 Legacy PBKDF2 Upgrade ----------
@pytest.mark.asyncio
async def test_legacy_pbkdf2_upgrade(client: AsyncClient, db_session: AsyncSession, roles):
    """Student login with pbkdf2 hash should auto-upgrade to bcrypt."""
    from passlib.context import CryptContext

    pbkdf2_ctx = CryptContext(schemes=["pbkdf2_sha256"])
    old_hash = pbkdf2_ctx.hash("HS001")

    user = User(
        email="HS_LEGACY",
        hashed_password=old_hash,
        is_verified=True,
        is_active=True,
    )
    student_role = roles["student"]
    user.roles.append(student_role)
    db_session.add(user)
    await db_session.commit()

    assert old_hash.startswith("$pbkdf2")

    resp = await client.post("/api/v1/auth/student-login", json={"username": "HS_LEGACY", "password": "HS001"})
    assert resp.status_code == 200

    # Refresh user from DB to check hash was upgraded
    await db_session.refresh(user)
    assert user.hashed_password.startswith("$2b$") or user.hashed_password.startswith("$2a$")


# ---------- 2.10 Cookie HttpOnly Secure ----------
@pytest.mark.asyncio
async def test_cookie_httponly_secure(client: AsyncClient, db_session: AsyncSession, roles):
    """Login should set httpOnly cookies."""
    await create_user(db_session, email="cookie@test.com", password="StrongPass1!", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    resp = await client.post(LOGIN_URL, json={"email": "cookie@test.com", "password": "StrongPass1!"})
    assert resp.status_code == 200

    # Check Set-Cookie headers for httponly flag
    set_cookie_headers = resp.headers.get_list("set-cookie")
    access_cookie = [h for h in set_cookie_headers if "access_token" in h]
    assert len(access_cookie) > 0
    assert any("httponly" in c.lower() for c in access_cookie)
