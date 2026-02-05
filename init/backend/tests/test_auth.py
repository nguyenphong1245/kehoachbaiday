import pytest
from httpx import AsyncClient


REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
HEALTH_URL = "/health"

VALID_USER = {
    "email": "test@example.com",
    "password": "StrongPass1!",
}


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    resp = await client.get(HEALTH_URL)
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    resp = await client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == VALID_USER["email"]


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post(REGISTER_URL, json=VALID_USER)
    resp = await client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    resp = await client.post(REGISTER_URL, json={"email": "not-an-email", "password": "StrongPass1!"})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post(REGISTER_URL, json=VALID_USER)
    resp = await client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": "WrongPass1!"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    resp = await client.post(LOGIN_URL, json={"email": "nobody@example.com", "password": "StrongPass1!"})
    assert resp.status_code == 401
