"""Tests for admin API: AI providers (masked) + provider trong model settings (Task MP4)."""
import pytest
from httpx import AsyncClient

from tests.helpers.auth_helpers import auth_get, auth_put


ADMIN_URL = "/api/v1/admin"


@pytest.mark.asyncio
async def test_get_providers_masked(client: AsyncClient, admin_user):
    resp = await auth_get(client, f"{ADMIN_URL}/ai-providers", admin_user.id)
    assert resp.status_code == 200
    provs = {p["provider"]: p for p in resp.json()}
    assert set(provs) == {"gemini", "openai", "deepseek"}
    assert "api_key" not in provs["openai"]  # không trả full key


@pytest.mark.asyncio
async def test_put_provider_sets_key_masked(client: AsyncClient, admin_user):
    resp = await auth_put(
        client, f"{ADMIN_URL}/ai-providers/openai", admin_user.id,
        json={"api_key": "sk-testkey7788"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["configured"] is True
    assert body["key_last4"] == "7788"


@pytest.mark.asyncio
async def test_put_provider_invalid(client: AsyncClient, admin_user):
    resp = await auth_put(
        client, f"{ADMIN_URL}/ai-providers/bogus", admin_user.id,
        json={"api_key": "x"},
    )
    assert resp.status_code in (400, 404)


@pytest.mark.asyncio
async def test_put_model_settings_with_provider(client: AsyncClient, admin_user):
    resp = await auth_put(
        client, f"{ADMIN_URL}/ai-model-settings", admin_user.id,
        json={"settings": [
            {"feature_key": "kg_lpv_n3_judge", "provider": "openai", "model_name": "gpt-4o"},
        ]},
    )
    assert resp.status_code == 200
    row = next(s for s in resp.json()["settings"] if s["feature_key"] == "kg_lpv_n3_judge")
    assert row["provider"] == "openai"
    assert row["model_name"] == "gpt-4o"


@pytest.mark.asyncio
async def test_non_admin_forbidden(client: AsyncClient, teacher_user):
    resp = await auth_get(client, f"{ADMIN_URL}/ai-providers", teacher_user.id)
    assert resp.status_code in (401, 403)
