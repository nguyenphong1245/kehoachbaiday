"""Test POST /verify + GET /jobs/{id}: tạo job, trừ/kiểm token, chạy nền, poll trạng thái."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.graph_client import graph_client
from tests.conftest import TestingSessionLocal
from tests.helpers.auth_helpers import auth_get, auth_post
from tests.helpers.factories import create_teacher

VERIFY_URL = "/api/v1/kg-lpv/verify"
JOB_URL = "/api/v1/kg-lpv/jobs/{job_id}"

_SECTIONS = [
    {
        "section_id": "muc_tieu",
        "section_type": "muc_tieu",
        "title": "Mục tiêu",
        "content": "Trình bày được khái niệm mạng máy tính.",
    },
    {
        "section_id": "khoi_dong",
        "section_type": "khoi_dong",
        "title": "Khởi động",
        "content": "Mục tiêu: dẫn nhập.",
    },
]

_LLM_RESPONSE = {
    "objective_clauses": [
        {
            "segment_id": "muc_tieu__1",
            "section_id": "muc_tieu",
            "loai": "kien_thuc",
            "text": "Trình bày được khái niệm mạng máy tính.",
        },
    ],
    "activity_components": [
        {
            "segment_id": "khoi_dong__muc_tieu",
            "section_id": "khoi_dong",
            "component": "muc_tieu",
            "text": "Mục tiêu: dẫn nhập.",
        },
    ],
}


@pytest.fixture(autouse=True)
def _reset_kg_lpv_caches():
    feature_flag_accessor.invalidate_cache()
    graph_client._healthy_cache = None
    graph_client._healthy_cache_time = 0.0
    yield
    feature_flag_accessor.invalidate_cache()
    graph_client._healthy_cache = None
    graph_client._healthy_cache_time = 0.0


async def _set_kg_lpv_flag(db_session: AsyncSession, enabled: bool) -> None:
    flag = await db_session.get(FeatureFlag, "kg_lpv")
    if flag is None:
        db_session.add(FeatureFlag(key="kg_lpv", enabled=enabled))
    else:
        flag.enabled = enabled
    await db_session.commit()
    feature_flag_accessor.invalidate_cache()


@pytest.fixture
async def kg_lpv_client():
    """Client dùng app build lại với KG_LPV_ENABLED=true (mô phỏng 'restart' tầng 2)."""
    import os

    from app.core.config import get_settings
    from app.db.session import get_db
    from app.main import get_app
    from httpx import ASGITransport
    from tests.conftest import override_get_db

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


@pytest.fixture
async def ready_kg_lpv(kg_lpv_client: AsyncClient, db_session, monkeypatch):
    """DB flag ON + đồ thị healthy — sẵn sàng gọi các endpoint nghiệp vụ."""
    await _set_kg_lpv_flag(db_session, True)
    monkeypatch.setattr(graph_client, "is_healthy", lambda force=False: True)
    return kg_lpv_client


def _capture_create_task(monkeypatch):
    """Chặn create_task trong router để lấy coroutine job nền, await trực tiếp
    trong test (thay vì chạy song song không kiểm soát được).

    QUAN TRỌNG: chỉ patch tên `create_task` cục bộ của module router (được
    import theo kiểu `from asyncio import create_task`), KHÔNG patch
    `asyncio.create_task` toàn cục — asyncio module là singleton dùng chung
    cho cả tiến trình, và SQLAlchemy async session tự dùng `asyncio.create_task`
    nội bộ khi đóng session (`AsyncSession.__aexit__` -> `asyncio.shield(...)`).
    Patch toàn cục khiến việc đóng session ném TypeError, session không đóng
    sạch, giữ transaction "idle in transaction" và khoá bảng — làm treo cả
    tiến trình pytest khi fixture dọn dẹp DB (drop_all) chờ khoá không bao giờ
    được giải phóng.
    """
    captured: list = []

    def _fake_create_task(coro, *args, **kwargs):
        captured.append(coro)
        return MagicMock()

    monkeypatch.setattr("app.modules.kg_lpv.router.create_task", _fake_create_task)
    return captured


@pytest.mark.asyncio
async def test_verify_owned_plan_returns_202_with_job_id(
    ready_kg_lpv, db_session, teacher_user, monkeypatch
):
    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_LLM_RESPONSE, 42)),
    ):
        resp = await auth_post(
            ready_kg_lpv, VERIFY_URL, teacher_user.id, json={"lesson_plan_id": plan.id}
        )

    assert resp.status_code == 202
    body = resp.json()
    assert "job_id" in body
    assert len(captured) == 1
    # Job nền chưa được chạy trong test này — đóng coroutine để tránh cảnh báo
    # "coroutine was never awaited" và rò rỉ tài nguyên.
    captured[0].close()


@pytest.mark.asyncio
async def test_verify_job_reaches_done_with_progress_100(
    ready_kg_lpv, db_session, teacher_user, monkeypatch
):
    # run_job() mở session riêng qua AsyncSessionLocal (app.db.session) — đó là
    # engine PRODUCTION có pool (pool_size=20), không phải engine test NullPool.
    # Khi test await trực tiếp coroutine này, các kết nối pooled không bao giờ
    # được giải phóng và giữ event loop sống -> tiến trình pytest treo. Trỏ
    # orchestrator sang sessionmaker của DB test (NullPool, dispose sạch).
    monkeypatch.setattr(
        "app.modules.kg_lpv.pipeline.orchestrator.AsyncSessionLocal", TestingSessionLocal
    )

    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_LLM_RESPONSE, 42)),
    ):
        resp = await auth_post(
            ready_kg_lpv, VERIFY_URL, teacher_user.id, json={"lesson_plan_id": plan.id}
        )
        assert resp.status_code == 202
        job_id = resp.json()["job_id"]

        # Chạy job nền đồng bộ (đã được "chụp" lại thay vì asyncio.create_task)
        await captured[0]

    resp2 = await auth_get(ready_kg_lpv, JOB_URL.format(job_id=job_id), teacher_user.id)
    assert resp2.status_code == 200
    body = resp2.json()
    assert body["status"] == "done"
    assert body["progress"] == 100
    assert body["stats"]["tokens"] == 42


@pytest.mark.asyncio
async def test_verify_insufficient_token_returns_402(ready_kg_lpv, db_session, roles):
    teacher = await create_teacher(db_session, roles, email="poor@test.com", token_balance=0)
    await db_session.commit()

    plan = SavedLessonPlan(
        user_id=teacher.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
    )
    db_session.add(plan)
    await db_session.commit()

    resp = await auth_post(
        ready_kg_lpv, VERIFY_URL, teacher.id, json={"lesson_plan_id": plan.id}
    )
    assert resp.status_code == 402


@pytest.mark.asyncio
async def test_verify_non_owned_plan_returns_404(ready_kg_lpv, db_session, roles):
    owner = await create_teacher(db_session, roles, email="owner@test.com")
    other = await create_teacher(db_session, roles, email="other@test.com")
    await db_session.commit()

    plan = SavedLessonPlan(
        user_id=owner.id, title="KHBD của người khác", content="noi dung", sections=_SECTIONS,
    )
    db_session.add(plan)
    await db_session.commit()

    resp = await auth_post(
        ready_kg_lpv, VERIFY_URL, other.id, json={"lesson_plan_id": plan.id}
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_job_non_owned_returns_404(ready_kg_lpv, db_session, roles, monkeypatch):
    owner = await create_teacher(db_session, roles, email="owner2@test.com")
    other = await create_teacher(db_session, roles, email="other2@test.com")
    await db_session.commit()

    plan = SavedLessonPlan(
        user_id=owner.id, title="KHBD", content="noi dung", sections=_SECTIONS,
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_LLM_RESPONSE, 42)),
    ):
        resp = await auth_post(
            ready_kg_lpv, VERIFY_URL, owner.id, json={"lesson_plan_id": plan.id}
        )
        job_id = resp.json()["job_id"]
    # Job nền chưa được chạy trong test này — đóng coroutine để tránh cảnh báo
    # "coroutine was never awaited" và rò rỉ tài nguyên.
    captured[0].close()

    resp2 = await auth_get(ready_kg_lpv, JOB_URL.format(job_id=job_id), other.id)
    assert resp2.status_code == 404
