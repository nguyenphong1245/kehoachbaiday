"""Tests for authentication endpoints (Module 1 - 23 test cases)."""

import hashlib
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, hash_refresh_token
from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from tests.helpers.auth_helpers import (
    CSRF_TOKEN_URL,
    LOGIN_URL,
    LOGOUT_URL,
    REFRESH_URL,
    REGISTER_URL,
    REQUEST_PASSWORD_RESET_URL,
    RESEND_VERIFICATION_URL,
    RESET_PASSWORD_URL,
    STUDENT_LOGIN_URL,
    VERIFY_EMAIL_URL,
    WS_TOKEN_URL,
    auth_get,
    csrf_headers_and_cookies,
    make_auth_cookies,
)
from tests.helpers.factories import create_student_user, create_teacher, create_user, ensure_roles

VALID_USER = {"email": "test@example.com", "password": "StrongPass1!"}


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


# ---------- 1.1 Register Success ----------
@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    with patch("app.api.routes.auth.send_verification_email"):
        resp = await client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == VALID_USER["email"]
    assert data["is_verified"] is False


# ---------- 1.2 Register Duplicate Email ----------
@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    with patch("app.api.routes.auth.send_verification_email"):
        await client.post(REGISTER_URL, json=VALID_USER)
        resp = await client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 400


# ---------- 1.3 Register Invalid Email ----------
@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    resp = await client.post(REGISTER_URL, json={"email": "not-an-email", "password": "StrongPass1!"})
    assert resp.status_code == 422


# ---------- 1.4 Register Weak Password ----------
@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    resp = await client.post(REGISTER_URL, json={"email": "test@example.com", "password": "weak"})
    assert resp.status_code == 422


# ---------- 1.5 Verify Email Success ----------
@pytest.mark.asyncio
async def test_verify_email_success(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="verify@test.com", is_verified=False, roles=roles, role_names=["teacher"])
    otp = "12345678"
    token = EmailVerificationToken(
        token=_hash_otp(otp),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db_session.add(token)
    await db_session.commit()

    resp = await client.post(VERIFY_EMAIL_URL, json={"email": "verify@test.com", "token": otp})
    assert resp.status_code == 200
    assert "verified" in resp.json()["message"].lower()


# ---------- 1.6 Verify Email Wrong Code ----------
@pytest.mark.asyncio
async def test_verify_email_wrong_code(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="verify2@test.com", is_verified=False, roles=roles, role_names=["teacher"])
    otp = "12345678"
    token = EmailVerificationToken(
        token=_hash_otp(otp),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db_session.add(token)
    await db_session.commit()

    resp = await client.post(VERIFY_EMAIL_URL, json={"email": "verify2@test.com", "token": "99999999"})
    assert resp.status_code == 400


# ---------- 1.7 Verify Email Expired Code ----------
@pytest.mark.asyncio
async def test_verify_email_expired_code(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="verify3@test.com", is_verified=False, roles=roles, role_names=["teacher"])
    otp = "12345678"
    token = EmailVerificationToken(
        token=_hash_otp(otp),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) - timedelta(hours=1),  # expired
    )
    db_session.add(token)
    await db_session.commit()

    resp = await client.post(VERIFY_EMAIL_URL, json={"email": "verify3@test.com", "token": otp})
    assert resp.status_code == 400
    assert "expired" in resp.json()["detail"].lower()


# ---------- 1.8 Resend Verification ----------
@pytest.mark.asyncio
async def test_resend_verification(client: AsyncClient, db_session: AsyncSession, roles):
    await create_user(db_session, email="resend@test.com", is_verified=False, roles=roles, role_names=["teacher"])
    await db_session.commit()

    with patch("app.api.routes.auth.send_verification_email"):
        resp = await client.post(RESEND_VERIFICATION_URL, json={"email": "resend@test.com"})
    assert resp.status_code == 200


# ---------- 1.9 Login Success ----------
@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db_session: AsyncSession, roles):
    await create_user(db_session, email="login@test.com", password="StrongPass1!", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    resp = await client.post(LOGIN_URL, json={"email": "login@test.com", "password": "StrongPass1!"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["email"] == "login@test.com"
    # Check that cookies are set
    assert "teacher_access_token" in resp.cookies or "set-cookie" in resp.headers


# ---------- 1.10 Login Unverified Email ----------
@pytest.mark.asyncio
async def test_login_unverified_email(client: AsyncClient, db_session: AsyncSession, roles):
    await create_user(db_session, email="unverified@test.com", password="StrongPass1!", is_verified=False, roles=roles, role_names=["teacher"])
    await db_session.commit()

    resp = await client.post(LOGIN_URL, json={"email": "unverified@test.com", "password": "StrongPass1!"})
    assert resp.status_code == 403
    assert "verify" in resp.json()["detail"].lower()


# ---------- 1.11 Login Wrong Password ----------
@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db_session: AsyncSession, roles):
    await create_user(db_session, email="wrongpw@test.com", password="StrongPass1!", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    resp = await client.post(LOGIN_URL, json={"email": "wrongpw@test.com", "password": "WrongPass1!"})
    assert resp.status_code == 401


# ---------- 1.12 Login Nonexistent User ----------
@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    resp = await client.post(LOGIN_URL, json={"email": "nobody@example.com", "password": "StrongPass1!"})
    assert resp.status_code == 401


# ---------- 1.13 Student Login Success ----------
@pytest.mark.asyncio
async def test_student_login_success(client: AsyncClient, db_session: AsyncSession, roles):
    await create_student_user(db_session, roles, email="HS001", password="HS001")
    await db_session.commit()

    resp = await client.post(STUDENT_LOGIN_URL, json={"username": "HS001", "password": "HS001"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["email"] == "HS001"


# ---------- 1.14 Student Login Wrong Password ----------
@pytest.mark.asyncio
async def test_student_login_wrong_password(client: AsyncClient, db_session: AsyncSession, roles):
    await create_student_user(db_session, roles, email="HS002", password="HS002")
    await db_session.commit()

    resp = await client.post(STUDENT_LOGIN_URL, json={"username": "HS002", "password": "WRONG"})
    assert resp.status_code == 401


# ---------- 1.15 Refresh Token Success ----------
@pytest.mark.asyncio
async def test_refresh_token_success(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="refresh@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    raw_refresh = "test-refresh-token-value"
    db_session.add(RefreshToken(
        token_hash=hash_refresh_token(raw_refresh),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    await db_session.commit()

    resp = await client.post(REFRESH_URL, cookies={"teacher_refresh_token": raw_refresh})
    assert resp.status_code == 200
    assert resp.json()["message"] == "Token refreshed"


# ---------- 1.16 Refresh Token Invalid ----------
@pytest.mark.asyncio
async def test_refresh_token_invalid(client: AsyncClient):
    resp = await client.post(REFRESH_URL, cookies={"teacher_refresh_token": "invalid-token"})
    assert resp.status_code == 401


# ---------- 1.17 Refresh Token Rotation ----------
@pytest.mark.asyncio
async def test_refresh_token_rotation(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="rotate@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    raw_refresh = "old-refresh-token"
    db_session.add(RefreshToken(
        token_hash=hash_refresh_token(raw_refresh),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    await db_session.commit()

    # First refresh should succeed
    resp1 = await client.post(REFRESH_URL, cookies={"teacher_refresh_token": raw_refresh})
    assert resp1.status_code == 200

    # Reusing the old token should fail (it was revoked)
    resp2 = await client.post(REFRESH_URL, cookies={"teacher_refresh_token": raw_refresh})
    assert resp2.status_code == 401


# ---------- 1.18 Logout Success ----------
@pytest.mark.asyncio
async def test_logout_success(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="logout@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    raw_refresh = "logout-refresh-token"
    db_session.add(RefreshToken(
        token_hash=hash_refresh_token(raw_refresh),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    await db_session.commit()

    csrf_h, csrf_c = csrf_headers_and_cookies()
    cookies = {"teacher_refresh_token": raw_refresh}
    cookies.update(csrf_c)
    cookies.update(make_auth_cookies(user.id))

    resp = await client.post(LOGOUT_URL, headers=csrf_h, cookies=cookies)
    assert resp.status_code == 200
    assert resp.json()["message"] == "Logged out"


# ---------- 1.19 Request Password Reset ----------
@pytest.mark.asyncio
async def test_request_password_reset(client: AsyncClient, db_session: AsyncSession, roles):
    await create_user(db_session, email="reset@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    from tests.helpers.auth_helpers import csrf_headers_and_cookies
    csrf_h, csrf_c = csrf_headers_and_cookies()

    with patch("app.api.routes.auth.send_password_reset_email"):
        resp = await client.post(REQUEST_PASSWORD_RESET_URL, json={"email": "reset@test.com"}, headers=csrf_h, cookies=csrf_c)
    assert resp.status_code == 200


# ---------- 1.20 Reset Password Success ----------
@pytest.mark.asyncio
async def test_reset_password_success(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="resetpw@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    otp = "87654321"
    db_session.add(PasswordResetToken(
        token=_hash_otp(otp),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))
    await db_session.commit()

    resp = await client.post(RESET_PASSWORD_URL, json={
        "email": "resetpw@test.com",
        "token": otp,
        "password": "NewStrongPass1!",
    })
    assert resp.status_code == 200
    assert "updated" in resp.json()["message"].lower() or "password" in resp.json()["message"].lower()


# ---------- 1.21 Reset Password Wrong OTP ----------
@pytest.mark.asyncio
async def test_reset_password_wrong_otp(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="resetwrong@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    otp = "87654321"
    db_session.add(PasswordResetToken(
        token=_hash_otp(otp),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))
    await db_session.commit()

    resp = await client.post(RESET_PASSWORD_URL, json={
        "email": "resetwrong@test.com",
        "token": "11111111",
        "password": "NewStrongPass1!",
    })
    assert resp.status_code == 400


# ---------- 1.22 Get CSRF Token ----------
@pytest.mark.asyncio
async def test_get_csrf_token(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="csrf@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    cookies = make_auth_cookies(user.id)
    resp = await client.get(CSRF_TOKEN_URL, cookies=cookies)
    assert resp.status_code == 200
    assert "csrf_token" in resp.json()


# ---------- 1.23 Get WS Token ----------
@pytest.mark.asyncio
async def test_get_ws_token(client: AsyncClient, db_session: AsyncSession, roles):
    user = await create_user(db_session, email="ws@test.com", is_verified=True, roles=roles, role_names=["teacher"])
    await db_session.commit()

    cookies = make_auth_cookies(user.id)
    resp = await client.get(WS_TOKEN_URL, cookies=cookies)
    assert resp.status_code == 200
    assert "token" in resp.json()
