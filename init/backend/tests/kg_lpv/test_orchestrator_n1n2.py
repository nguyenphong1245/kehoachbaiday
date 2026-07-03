"""Test tích hợp orchestrator: N1 ‖ N2 chạy song song, sổ lỗi persist, job 'done'.

Mock graph + genai hoàn toàn — không Neo4j/Gemini thật. Theo pattern Task 3
(`test_verify_api.py`): patch `router.create_task` cục bộ (không patch
`asyncio.create_task` toàn cục) và trỏ `orchestrator.AsyncSessionLocal` sang
sessionmaker DB test để job nền không giữ kết nối pooled sống, tránh treo tiến trình.
"""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.error_codes import ErrorCode, VerificationBranch
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.llm import LlmJsonError
from app.modules.kg_lpv.models import KgLpvFinding
from app.modules.kg_lpv.pipeline import n2_curriculum
from app.modules.kg_lpv.schemas import LessonContext
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
    yccd=[],  # rỗng -> M1 "không có YCCĐ" chắc chắn xảy ra, không cần fuzzy
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


@pytest.mark.asyncio
async def test_orchestrator_persists_findings_from_both_n1_and_n2_and_reaches_done(
    ready_kg_lpv, db_session, teacher_user, monkeypatch
):
    monkeypatch.setattr(
        "app.modules.kg_lpv.pipeline.orchestrator.AsyncSessionLocal", TestingSessionLocal
    )
    # N1: không tìm thấy bài học nào khớp -> đúng 1 finding D1
    monkeypatch.setattr(graph_client, "find_lesson_by_identity", lambda **kw: None)
    monkeypatch.setattr(graph_client, "search_lessons_fuzzy", lambda **kw: [])
    # N2: gói ngữ cảnh canned (yccd rỗng -> M1); M6 qua LLM mock verdict lỗi
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: _LESSON_CTX)

    m6_response = (
        {
            "verdict": "khong_can_cu",
            "evidence_refs": [{"kg_node_id": "MDKT-X", "trich_dan": "..."}],
            "explanation": "Kiến thức trong hoạt động không có căn cứ.",
        },
        7,
    )
    mock_n2_llm = AsyncMock(return_value=m6_response)
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_n2_llm)

    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
        grade="10", lesson_name="Bài 1: Thông tin và xử lý thông tin",
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_SEGMENTATION_RESPONSE, 42)),
    ):
        resp = await auth_post(
            ready_kg_lpv, VERIFY_URL, teacher_user.id, json={"lesson_plan_id": plan.id}
        )
        assert resp.status_code == 202
        job_id = resp.json()["job_id"]
        await captured[0]

    resp2 = await auth_get(ready_kg_lpv, JOB_URL.format(job_id=job_id), teacher_user.id)
    assert resp2.status_code == 200
    body = resp2.json()
    assert body["status"] == "done"
    assert body["progress"] == 100

    result = await db_session.execute(select(KgLpvFinding).where(KgLpvFinding.job_id == job_id))
    findings = result.scalars().all()

    codes_branches = {(f.code, f.branch) for f in findings}
    assert (ErrorCode.D1.value, VerificationBranch.N1.value) in codes_branches
    assert (ErrorCode.M1.value, VerificationBranch.N2.value) in codes_branches
    assert (ErrorCode.M6.value, VerificationBranch.N2.value) in codes_branches
    for f in findings:
        assert f.evidence  # bất biến: mọi finding persist đều có evidence non-empty


@pytest.mark.asyncio
async def test_orchestrator_llm_judge_failure_does_not_fail_job(
    ready_kg_lpv, db_session, teacher_user, monkeypatch
):
    monkeypatch.setattr(
        "app.modules.kg_lpv.pipeline.orchestrator.AsyncSessionLocal", TestingSessionLocal
    )
    monkeypatch.setattr(graph_client, "find_lesson_by_identity", lambda **kw: None)
    monkeypatch.setattr(graph_client, "search_lessons_fuzzy", lambda **kw: [])
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: _LESSON_CTX)

    mock_n2_llm = AsyncMock(side_effect=LlmJsonError("AI trả JSON hỏng"))
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_n2_llm)

    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
        grade="10", lesson_name="Bài 1: Thông tin và xử lý thông tin",
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_SEGMENTATION_RESPONSE, 42)),
    ):
        resp = await auth_post(
            ready_kg_lpv, VERIFY_URL, teacher_user.id, json={"lesson_plan_id": plan.id}
        )
        job_id = resp.json()["job_id"]
        await captured[0]

    resp2 = await auth_get(ready_kg_lpv, JOB_URL.format(job_id=job_id), teacher_user.id)
    assert resp2.status_code == 200
    body = resp2.json()
    assert body["status"] == "done"  # KHÔNG 'failed' dù M6 LLM lỗi

    result = await db_session.execute(select(KgLpvFinding).where(KgLpvFinding.job_id == job_id))
    findings = result.scalars().all()
    # M6 bị lỗi LLM -> không tạo finding (không phải false positive); D1 + M1 vẫn còn
    assert all(f.code != ErrorCode.M6.value for f in findings)
    codes_branches = {(f.code, f.branch) for f in findings}
    assert (ErrorCode.D1.value, VerificationBranch.N1.value) in codes_branches
    assert (ErrorCode.M1.value, VerificationBranch.N2.value) in codes_branches


@pytest.mark.asyncio
async def test_orchestrator_insufficient_token_still_returns_402(ready_kg_lpv, db_session, roles):
    """Regression nhỏ: đảm bảo Task 5 không phá vỡ luồng kiểm token đã có (Task 3)."""
    teacher = await create_teacher(db_session, roles, email="poor-n2@test.com", token_balance=0)
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
