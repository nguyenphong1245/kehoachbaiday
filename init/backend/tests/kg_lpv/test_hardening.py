"""Test Task 9 — hardening: startup recovery job kẹt (§13 rủi ro #5), export
findings phục vụ gán nhãn chuyên gia (§6.3, §14), timings vào `job.stats` (§9),
lỗi đồ thị giữa job không làm treo/sập tiến trình.

Mock graph + `generate_json` hoàn toàn — không Neo4j/Gemini thật. Cùng pattern
Task 3/5/6/8 (patch `router.create_task` cục bộ + trỏ `orchestrator.AsyncSessionLocal`
sang sessionmaker DB test) để job nền không giữ kết nối pooled sống.
"""
import csv
import io
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.models import KgLpvFinding, KgLpvJob
from app.modules.kg_lpv.pipeline import n2_curriculum, orchestrator
from app.modules.kg_lpv.schemas import LessonContext
from tests.conftest import TestingSessionLocal
from tests.helpers.auth_helpers import auth_get, auth_post
from tests.helpers.factories import create_teacher

VERIFY_URL = "/api/v1/kg-lpv/verify"
JOB_URL = "/api/v1/kg-lpv/jobs/{job_id}"
EXPORT_URL = "/api/v1/kg-lpv/jobs/{job_id}/export"

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
        "content": "Mạng máy tính chỉ tồn tại trên thiết bị di động hiện đại nhất.",
    },
]

_SEGMENTATION_RESPONSE = {
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
            "segment_id": "khoi_dong__noi_dung",
            "section_id": "khoi_dong",
            "component": "noi_dung",
            "text": "Mạng máy tính chỉ tồn tại trên thiết bị di động hiện đại nhất.",
        },
    ],
}

_LESSON_CTX = LessonContext(
    lesson=None,
    yccd=[],
    dong_tu_nhan_thuc={"do_duoc": [{"dong_tu": "trình bày được", "bac": 1}], "khong_do_duoc": []},
)


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
    await _set_kg_lpv_flag(db_session, True)
    monkeypatch.setattr(graph_client, "is_healthy", lambda force=False: True)
    return kg_lpv_client


def _capture_create_task(monkeypatch):
    captured: list = []

    def _fake_create_task(coro, *args, **kwargs):
        captured.append(coro)
        return MagicMock()

    monkeypatch.setattr("app.modules.kg_lpv.router.create_task", _fake_create_task)
    return captured


# =========================== (a) Startup recovery: job kẹt -> failed ===========================


@pytest.mark.asyncio
async def test_recover_stuck_jobs_marks_stale_non_terminal_jobs_failed(db_session, teacher_user, monkeypatch):
    monkeypatch.setattr(orchestrator, "AsyncSessionLocal", TestingSessionLocal)

    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=_SECTIONS)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    stale_created_at = datetime.now(timezone.utc) - timedelta(minutes=20)
    fresh_created_at = datetime.now(timezone.utc) - timedelta(minutes=1)

    stale_job = KgLpvJob(
        user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="verifying", progress=40,
        created_at=stale_created_at,
    )
    fresh_job = KgLpvJob(
        user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="segmenting", progress=10,
        created_at=fresh_created_at,
    )
    old_done_job = KgLpvJob(
        user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100,
        created_at=stale_created_at,
    )
    db_session.add_all([stale_job, fresh_job, old_done_job])
    await db_session.commit()
    for j in (stale_job, fresh_job, old_done_job):
        await db_session.refresh(j)

    recovered = await orchestrator.recover_stuck_jobs()
    assert recovered == 1

    await db_session.refresh(stale_job)
    await db_session.refresh(fresh_job)
    await db_session.refresh(old_done_job)

    assert stale_job.status == "failed"
    assert stale_job.error_message == "gián đoạn hệ thống, vui lòng chạy lại"
    assert fresh_job.status == "segmenting"  # còn mới -> không đụng tới
    assert old_done_job.status == "done"  # đã kết thúc -> không đụng tới


# =========================== (b) Export findings: JSON + CSV ===========================


@pytest.mark.asyncio
async def test_export_findings_json(ready_kg_lpv, db_session, teacher_user):
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=_SECTIONS)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M1", branch="N2", section_id="muc_tieu",
        evidence=[{"ma_dinh_danh": "YC1"}], explanation="Mục tiêu lệch YCCĐ.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()

    resp = await auth_get(ready_kg_lpv, EXPORT_URL.format(job_id=job.id), teacher_user.id)
    assert resp.status_code == 200
    rows = resp.json()
    assert len(rows) == 1
    row = rows[0]
    assert row["code"] == "M1"
    assert row["branch"] == "N2"
    assert row["section_id"] == "muc_tieu"
    assert row["status"] == "open"
    assert row["explanation"] == "Mục tiêu lệch YCCĐ."
    assert row["evidence"] == '[{"ma_dinh_danh": "YC1"}]'
    assert row["created_at"] is not None


@pytest.mark.asyncio
async def test_export_findings_csv(ready_kg_lpv, db_session, teacher_user):
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=_SECTIONS)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M6", branch="N2", section_id="khoi_dong",
        evidence=[{"ma_dinh_danh": "MDKT-1"}], explanation="Kiến thức thiếu căn cứ.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()

    resp = await auth_get(ready_kg_lpv, EXPORT_URL.format(job_id=job.id), teacher_user.id, params={"format": "csv"})
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")

    raw = resp.content.decode("utf-8-sig")  # BOM UTF-8 để Excel mở tiếng Việt đúng
    assert resp.content.startswith(b"\xef\xbb\xbf")

    reader = csv.DictReader(io.StringIO(raw))
    rows = list(reader)
    assert len(rows) == 1
    assert rows[0]["code"] == "M6"
    assert rows[0]["section_id"] == "khoi_dong"
    assert rows[0]["explanation"] == "Kiến thức thiếu căn cứ."


@pytest.mark.asyncio
async def test_export_non_owner_returns_404(ready_kg_lpv, db_session, roles):
    owner = await create_teacher(db_session, roles, email="owner-export@test.com")
    other = await create_teacher(db_session, roles, email="other-export@test.com")
    await db_session.commit()

    plan = SavedLessonPlan(user_id=owner.id, title="KHBD", content="c", sections=_SECTIONS)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=owner.id, saved_lesson_plan_id=plan.id, status="done", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    resp = await auth_get(ready_kg_lpv, EXPORT_URL.format(job_id=job.id), other.id)
    assert resp.status_code == 404


# =========================== (c) Timings được ghi vào job.stats ===========================


@pytest.mark.asyncio
async def test_job_stats_records_step_timings(ready_kg_lpv, db_session, teacher_user, monkeypatch):
    monkeypatch.setattr(orchestrator, "AsyncSessionLocal", TestingSessionLocal)
    monkeypatch.setattr(graph_client, "find_lesson_by_identity", lambda **kw: None)
    monkeypatch.setattr(graph_client, "search_lessons_fuzzy", lambda **kw: [])
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: _LESSON_CTX)
    monkeypatch.setattr(
        n2_curriculum, "generate_json",
        AsyncMock(return_value=({"verdict": "hop_le", "evidence_refs": [], "explanation": "OK"}, 0)),
    )

    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
        grade="10", lesson_name="Bài 1",
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_SEGMENTATION_RESPONSE, 42)),
    ):
        resp = await auth_post(ready_kg_lpv, VERIFY_URL, teacher_user.id, json={"lesson_plan_id": plan.id})
        job_id = resp.json()["job_id"]
        await captured[0]

    resp2 = await auth_get(ready_kg_lpv, JOB_URL.format(job_id=job_id), teacher_user.id)
    body = resp2.json()
    assert body["status"] == "done"

    timings = body["stats"]["timings"]
    for key in ("segment_ms", "n1n2_ms", "n3_ms"):
        assert key in timings
        assert isinstance(timings[key], int)
        assert timings[key] >= 0


# =========================== (d) Lỗi đồ thị giữa job -> job failed sạch ===========================


@pytest.mark.asyncio
async def test_graph_failure_mid_job_ends_job_failed_not_hang(ready_kg_lpv, db_session, teacher_user, monkeypatch):
    monkeypatch.setattr(orchestrator, "AsyncSessionLocal", TestingSessionLocal)
    monkeypatch.setattr(graph_client, "get_lesson_context", MagicMock(side_effect=RuntimeError("Neo4j mất kết nối")))

    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
        grade="10", lesson_name="Bài 1",
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_SEGMENTATION_RESPONSE, 42)),
    ):
        resp = await auth_post(ready_kg_lpv, VERIFY_URL, teacher_user.id, json={"lesson_plan_id": plan.id})
        job_id = resp.json()["job_id"]
        await captured[0]  # không được hang/raise ra ngoài test

    resp2 = await auth_get(ready_kg_lpv, JOB_URL.format(job_id=job_id), teacher_user.id)
    assert resp2.status_code == 200
    body = resp2.json()
    assert body["status"] == "failed"

    result = await db_session.execute(select(KgLpvJob).where(KgLpvJob.id == job_id))
    job = result.scalar_one()
    assert job.error_message  # kèm message rõ ràng, không phải chỉ status trống
