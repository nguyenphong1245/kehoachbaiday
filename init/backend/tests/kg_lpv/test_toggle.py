"""Test cơ chế bật/tắt 3 tầng của module KG-LPV (Task 1 - chỉ khung + toggle)."""
import os

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db
from app.main import get_app
from app.models.feature_flag import FeatureFlag
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.graph_client import graph_client
from tests.conftest import override_get_db
from tests.helpers.auth_helpers import auth_get, auth_put

STATUS_URL = "/api/v1/kg-lpv/status"
PROBE_URL = "/api/v1/kg-lpv/_probe"
FEATURE_FLAGS_URL = "/api/v1/admin/feature-flags"


@pytest.fixture(autouse=True)
def _reset_kg_lpv_caches():
    """Tránh cache TTL trong tiến trình (cờ DB 30s, sức khỏe đồ thị 60s) rò rỉ giữa các test."""
    feature_flag_accessor.invalidate_cache()
    graph_client._healthy_cache = None
    graph_client._healthy_cache_time = 0.0
    yield
    feature_flag_accessor.invalidate_cache()
    graph_client._healthy_cache = None
    graph_client._healthy_cache_time = 0.0


@pytest.fixture
async def kg_lpv_client():
    """Client dùng app build lại với KG_LPV_ENABLED=true (mô phỏng 'restart' tầng 2)."""
    original = os.environ.get("KG_LPV_ENABLED")
    os.environ["KG_LPV_ENABLED"] = "true"
    get_settings.cache_clear()
    try:
        app = get_app()
        app.dependency_overrides[get_db] = override_get_db
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test", follow_redirects=True) as ac:
            yield ac
        app.dependency_overrides.clear()
    finally:
        if original is None:
            os.environ.pop("KG_LPV_ENABLED", None)
        else:
            os.environ["KG_LPV_ENABLED"] = original
        get_settings.cache_clear()


async def _set_kg_lpv_flag(db_session: AsyncSession, enabled: bool) -> None:
    flag = await db_session.get(FeatureFlag, "kg_lpv")
    if flag is None:
        db_session.add(FeatureFlag(key="kg_lpv", enabled=enabled))
    else:
        flag.enabled = enabled
    await db_session.commit()
    feature_flag_accessor.invalidate_cache()


# ---------- env OFF (default) ----------

@pytest.mark.asyncio
async def test_status_env_off_returns_disabled(client: AsyncClient, teacher_user):
    resp = await auth_get(client, STATUS_URL, teacher_user.id)
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is False
    assert body["availability"] == "disabled"


@pytest.mark.asyncio
async def test_other_kg_lpv_routes_404_when_env_off(client: AsyncClient, teacher_user):
    resp = await auth_get(client, PROBE_URL, teacher_user.id)
    assert resp.status_code == 404


# ---------- env ON + DB flag OFF ----------

@pytest.mark.asyncio
async def test_env_on_flag_off_probe_returns_403(kg_lpv_client: AsyncClient, teacher_user):
    resp = await auth_get(kg_lpv_client, PROBE_URL, teacher_user.id)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_env_on_flag_off_status_shows_disabled(kg_lpv_client: AsyncClient, teacher_user):
    resp = await auth_get(kg_lpv_client, STATUS_URL, teacher_user.id)
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is False
    assert body["availability"] == "disabled"


# ---------- env ON + DB flag ON + graph down ----------

@pytest.mark.asyncio
async def test_env_on_flag_on_graph_down_probe_returns_503(
    kg_lpv_client: AsyncClient, teacher_user, db_session, monkeypatch
):
    await _set_kg_lpv_flag(db_session, True)
    monkeypatch.setattr(graph_client, "is_healthy", lambda force=False: False)

    resp = await auth_get(kg_lpv_client, PROBE_URL, teacher_user.id)
    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_env_on_flag_on_graph_down_status_is_degraded(
    kg_lpv_client: AsyncClient, teacher_user, db_session, monkeypatch
):
    await _set_kg_lpv_flag(db_session, True)
    monkeypatch.setattr(graph_client, "is_healthy", lambda force=False: False)

    resp = await auth_get(kg_lpv_client, STATUS_URL, teacher_user.id)
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is True
    assert body["availability"] == "degraded"


# ---------- env ON + DB flag ON + graph healthy ----------

@pytest.mark.asyncio
async def test_env_on_flag_on_graph_healthy_probe_returns_200(
    kg_lpv_client: AsyncClient, teacher_user, db_session, monkeypatch
):
    await _set_kg_lpv_flag(db_session, True)
    monkeypatch.setattr(graph_client, "is_healthy", lambda force=False: True)

    resp = await auth_get(kg_lpv_client, PROBE_URL, teacher_user.id)
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}


@pytest.mark.asyncio
async def test_env_on_flag_on_graph_healthy_status_is_ok(
    kg_lpv_client: AsyncClient, teacher_user, db_session, monkeypatch
):
    await _set_kg_lpv_flag(db_session, True)
    monkeypatch.setattr(graph_client, "is_healthy", lambda force=False: True)

    resp = await auth_get(kg_lpv_client, STATUS_URL, teacher_user.id)
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is True
    assert body["availability"] == "ok"


# ---------- Admin feature-flag API ----------

@pytest.mark.asyncio
async def test_admin_put_feature_flag_flips_effective_state_without_restart(
    kg_lpv_client: AsyncClient, admin_user, teacher_user, monkeypatch
):
    monkeypatch.setattr(graph_client, "is_healthy", lambda force=False: True)

    # Flag off by default -> probe forbidden
    resp = await auth_get(kg_lpv_client, PROBE_URL, teacher_user.id)
    assert resp.status_code == 403

    # Admin turns it on via API (no restart, no sleep for TTL)
    resp = await auth_put(
        kg_lpv_client, f"{FEATURE_FLAGS_URL}/kg_lpv", admin_user.id,
        json={"enabled": True},
    )
    assert resp.status_code == 200
    assert resp.json()["enabled"] is True

    # Takes effect immediately (cache invalidated by the PUT)
    resp = await auth_get(kg_lpv_client, PROBE_URL, teacher_user.id)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_admin_get_feature_flags_lists_updated_flag(kg_lpv_client: AsyncClient, admin_user):
    await auth_put(
        kg_lpv_client, f"{FEATURE_FLAGS_URL}/kg_lpv", admin_user.id,
        json={"enabled": True},
    )

    resp = await auth_get(kg_lpv_client, FEATURE_FLAGS_URL, admin_user.id)
    assert resp.status_code == 200
    flags = {f["key"]: f["enabled"] for f in resp.json()}
    assert flags.get("kg_lpv") is True


@pytest.mark.asyncio
async def test_admin_feature_flags_requires_admin_role(kg_lpv_client: AsyncClient, teacher_user):
    resp = await auth_get(kg_lpv_client, FEATURE_FLAGS_URL, teacher_user.id)
    assert resp.status_code == 403
