"""Test tích hợp toàn bộ pipeline 3 bước (tách đoạn -> N1‖N2 -> N3) + GET /report.

Mock graph + genai hoàn toàn — không Neo4j/Gemini thật (cùng pattern
`test_orchestrator_n1n2.py`, Task 5): patch `router.create_task` cục bộ và trỏ
`orchestrator.AsyncSessionLocal` sang sessionmaker DB test để job nền không giữ
kết nối pooled sống, tránh treo tiến trình.
"""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.error_codes import ErrorCode, VerificationBranch
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.models import KgLpvFinding, KgLpvJob
from app.modules.kg_lpv.pipeline import n2_curriculum
from app.modules.kg_lpv.schemas import LessonContext
from tests.conftest import TestingSessionLocal
from tests.helpers.auth_helpers import auth_get, auth_post
from tests.helpers.factories import create_teacher

VERIFY_URL = "/api/v1/kg-lpv/verify"
JOB_URL = "/api/v1/kg-lpv/jobs/{job_id}"
REPORT_URL = "/api/v1/kg-lpv/jobs/{job_id}/report"
DISMISS_URL = "/api/v1/kg-lpv/findings/{finding_id}/dismiss"

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

# Cố tình KHÔNG có thành phần `muc_tieu` cục bộ cho hoạt động "khoi_dong" (chỉ có
# `noi_dung`) -> trục 1 N3 chắc chắn gắn cờ C4 (mục tiêu không được hiện thực hoá)
# và trục 6 chắc chắn gắn cờ C5 (không có hoạt động luyện tập/vận dụng nào) —
# CẢ HAI đều THUẦN THUẬT TOÁN (không cần mock LLM riêng cho N3).
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
    yccd=[],  # rỗng -> M1 "không có YCCĐ" chắc chắn xảy ra
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
async def test_full_pipeline_produces_n1_n2_n3_findings_and_report_groups_by_branch(
    ready_kg_lpv, db_session, teacher_user, monkeypatch
):
    monkeypatch.setattr(
        "app.modules.kg_lpv.pipeline.orchestrator.AsyncSessionLocal", TestingSessionLocal
    )
    # N1: không tìm thấy bài học nào khớp -> đúng 1 finding D1
    monkeypatch.setattr(graph_client, "find_lesson_by_identity", lambda **kw: None)
    monkeypatch.setattr(graph_client, "search_lessons_fuzzy", lambda **kw: [])
    # N2: gói ngữ cảnh canned (yccd rỗng -> M1); M6 qua LLM mock verdict lỗi -> hoat_dong_loi_m
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

    resp3 = await auth_get(ready_kg_lpv, REPORT_URL.format(job_id=job_id), teacher_user.id)
    assert resp3.status_code == 200
    report = resp3.json()
    assert report["job_id"] == job_id
    assert report["status"] == "done"

    branches_by_name = {b["branch"]: b for b in report["branches"]}
    assert set(branches_by_name) == {"N1", "N2", "N3"}

    n1_codes = {f["code"] for f in branches_by_name["N1"]["findings"]}
    n2_codes = {f["code"] for f in branches_by_name["N2"]["findings"]}
    n3_codes = {f["code"] for f in branches_by_name["N3"]["findings"]}

    assert ErrorCode.D1.value in n1_codes
    assert ErrorCode.M1.value in n2_codes
    assert ErrorCode.M6.value in n2_codes
    # N3 chạy sống: trục 1 (C4, mục tiêu không hiện thực) và trục 6 (C5, không có
    # hoạt động luyện tập/vận dụng) đều thuần thuật toán, chắc chắn xảy ra với fixture này.
    assert ErrorCode.C4.value in n3_codes
    assert ErrorCode.C5.value in n3_codes

    assert branches_by_name["N1"]["counts_by_code"][ErrorCode.D1.value] == 1
    assert branches_by_name["N2"]["counts_by_code"][ErrorCode.M1.value] == 1

    assert report["summary"]["total_confirmed"] == sum(
        len(b["findings"]) for b in report["branches"]
    )
    # unjudged (nếu có) không được cộng vào total_confirmed
    for f in report["unjudged"]:
        assert f["status"] == "unjudged"

    for branch in report["branches"]:
        for f in branch["findings"]:
            assert f["evidence"]  # bất biến: mọi finding trong sổ lỗi đều có evidence


@pytest.mark.asyncio
async def test_report_non_owned_job_returns_404(ready_kg_lpv, db_session, roles, monkeypatch):
    monkeypatch.setattr(
        "app.modules.kg_lpv.pipeline.orchestrator.AsyncSessionLocal", TestingSessionLocal
    )
    monkeypatch.setattr(graph_client, "find_lesson_by_identity", lambda **kw: None)
    monkeypatch.setattr(graph_client, "search_lessons_fuzzy", lambda **kw: [])
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: _LESSON_CTX)
    monkeypatch.setattr(
        n2_curriculum, "generate_json",
        AsyncMock(return_value=({"verdict": "hop_le", "evidence_refs": [], "explanation": "OK"}, 0)),
    )

    owner = await create_teacher(db_session, roles, email="owner-report@test.com")
    other = await create_teacher(db_session, roles, email="other-report@test.com")
    await db_session.commit()

    plan = SavedLessonPlan(
        user_id=owner.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
    )
    db_session.add(plan)
    await db_session.commit()

    captured = _capture_create_task(monkeypatch)
    with patch(
        "app.modules.kg_lpv.pipeline.segmenter.generate_json",
        new=AsyncMock(return_value=(_SEGMENTATION_RESPONSE, 42)),
    ):
        resp = await auth_post(ready_kg_lpv, VERIFY_URL, owner.id, json={"lesson_plan_id": plan.id})
        job_id = resp.json()["job_id"]
        await captured[0]

    resp2 = await auth_get(ready_kg_lpv, REPORT_URL.format(job_id=job_id), other.id)
    assert resp2.status_code == 404


@pytest.mark.asyncio
async def test_report_summary_excludes_dismissed_finding(ready_kg_lpv, db_session, teacher_user):
    """Correctness fix (final-review Finding 2): giáo viên bác bỏ 1 finding (§8)
    -> finding đó KHÔNG còn là lỗi đang hoạt động, phải biến mất khỏi
    `total_confirmed`/`summary` và khỏi danh sách `findings` của nhánh của nó
    (trước fix, router chỉ loại `unjudged`, vẫn cộng `dismissed` vào confirmed)."""
    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=_SECTIONS,
    )
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    f_open = KgLpvFinding(
        job_id=job.id, code=ErrorCode.M1.value, branch=VerificationBranch.N2.value, section_id="muc_tieu",
        evidence=[{"a": 1}], explanation="Mục tiêu lệch YCCĐ.", status="open",
    )
    f_to_dismiss = KgLpvFinding(
        job_id=job.id, code=ErrorCode.M2.value, branch=VerificationBranch.N2.value, section_id="muc_tieu",
        evidence=[{"a": 1}], explanation="Động từ không đo được.", status="open",
    )
    db_session.add_all([f_open, f_to_dismiss])
    await db_session.commit()
    for f in (f_open, f_to_dismiss):
        await db_session.refresh(f)

    resp_before = await auth_get(ready_kg_lpv, REPORT_URL.format(job_id=job.id), teacher_user.id)
    assert resp_before.status_code == 200
    report_before = resp_before.json()
    assert report_before["summary"]["total_confirmed"] == 2

    resp_dismiss = await auth_post(ready_kg_lpv, DISMISS_URL.format(finding_id=f_to_dismiss.id), teacher_user.id)
    assert resp_dismiss.status_code == 200
    assert resp_dismiss.json()["status"] == "dismissed"

    resp_after = await auth_get(ready_kg_lpv, REPORT_URL.format(job_id=job.id), teacher_user.id)
    assert resp_after.status_code == 200
    report_after = resp_after.json()

    assert report_after["summary"]["total_confirmed"] == 1
    assert report_after["summary"].get(ErrorCode.M2.value, 0) == 0

    n2_findings = next(b for b in report_after["branches"] if b["branch"] == "N2")["findings"]
    n2_codes = {f["code"] for f in n2_findings}
    assert ErrorCode.M1.value in n2_codes
    assert ErrorCode.M2.value not in n2_codes

    # dismissed KHÔNG phải unjudged -> không được lọt vào danh sách unjudged
    assert all(f["status"] != "dismissed" for f in report_after["unjudged"])
