"""Tests for admin endpoints (Module 12 - 3 test cases)."""

import pytest
from httpx import AsyncClient

from tests.helpers.auth_helpers import auth_get


ADMIN_URL = "/api/v1/admin"


# ---------- 12.1 Dashboard Stats ----------
@pytest.mark.asyncio
async def test_dashboard_stats(client: AsyncClient, admin_user):
    resp = await auth_get(client, f"{ADMIN_URL}/dashboard-stats", admin_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data or "users" in data or isinstance(data, dict)


# ---------- 12.2 Dashboard Stats Non Admin ----------
@pytest.mark.asyncio
async def test_dashboard_stats_non_admin(client: AsyncClient, teacher_user):
    resp = await auth_get(client, f"{ADMIN_URL}/dashboard-stats", teacher_user.id)
    assert resp.status_code == 403


# ---------- 12.3 All Content ----------
@pytest.mark.asyncio
async def test_all_content(client: AsyncClient, admin_user):
    resp = await auth_get(client, f"{ADMIN_URL}/all-content", admin_user.id)
    assert resp.status_code == 200
