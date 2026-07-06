"""Test Bước 4 — Sửa & kiểm lại (`repairer.repair`) + endpoint `/repair`, `/diff`,
`/apply` (§7 Bước 4, §6.3).

Mock graph + `generate_json` hoàn toàn — không Neo4j/Gemini thật. Theo pattern
Task 3/5/6 (`test_verify_api.py`, `test_orchestrator_n1n2.py`): patch
`router.create_task` cục bộ + trỏ `repairer.AsyncSessionLocal` sang sessionmaker
DB test để job nền không giữ kết nối pooled sống (tránh treo tiến trình).
"""
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.models import KgLpvFinding, KgLpvJob
from app.modules.kg_lpv.pipeline import n2_curriculum, n3_pedagogy, repairer, segmenter
from app.modules.kg_lpv.pipeline.repairer import repair
from app.modules.kg_lpv.schemas import (
    ActivityComponentSegment,
    LessonContext,
    ObjectiveClauseSegment,
    SegmentedPlan,
)
from tests.conftest import TestingSessionLocal
from tests.helpers.auth_helpers import auth_get, auth_post
from tests.helpers.factories import create_teacher

REPAIR_URL = "/api/v1/kg-lpv/jobs/{job_id}/repair"
DIFF_URL = "/api/v1/kg-lpv/jobs/{job_id}/diff"
APPLY_URL = "/api/v1/kg-lpv/jobs/{job_id}/apply"
JOB_URL = "/api/v1/kg-lpv/jobs/{job_id}"


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


def _obj(segment_id, loai, text, section_id="muc_tieu") -> ObjectiveClauseSegment:
    return ObjectiveClauseSegment(segment_id=segment_id, section_id=section_id, loai=loai, text=text)


def _act(segment_id, component, text, section_id) -> ActivityComponentSegment:
    return ActivityComponentSegment(segment_id=segment_id, section_id=section_id, component=component, text=text)


# =========================== (a) Endpoint: chỉ đúng section thay đổi ===========================


@pytest.mark.asyncio
async def test_repair_via_api_changes_only_target_section(
    ready_kg_lpv, db_session, teacher_user, monkeypatch
):
    monkeypatch.setattr("app.modules.kg_lpv.pipeline.repairer.AsyncSessionLocal", TestingSessionLocal)
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: LessonContext())
    monkeypatch.setattr(
        repairer, "generate_json",
        AsyncMock(return_value=({"after": "Nội dung đã sửa đúng chuẩn."}, 10)),
    )
    # An toàn: nếu re-verify lỡ gọi tới M2/M6 (không nên xảy ra với fixture này),
    # trả về verdict "hợp lệ" để không tạo finding mới ngoài ý muốn.
    monkeypatch.setattr(
        n2_curriculum, "generate_json",
        AsyncMock(return_value=({"verdict": "hop_le", "evidence_refs": [], "explanation": "OK"}, 0)),
    )

    sections = [
        {"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Mục tiêu gốc."},
        {"section_id": "khoi_dong", "section_type": "khoi_dong", "title": "Khởi động", "content": "Nội dung gốc chưa đúng."},
    ]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    segments = SegmentedPlan(
        objective_clauses=[],
        activity_components=[_act("khoi_dong__noi_dung", "noi_dung", "Nội dung gốc chưa đúng.", "khoi_dong")],
    ).model_dump(mode="json")

    job = KgLpvJob(
        user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100, segments=segments,
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M6", branch="N2", section_id="khoi_dong",
        evidence=[{"ma_dinh_danh": "MDKT-1", "trich_dan": "..."}],
        explanation="Kiến thức thiếu căn cứ.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    captured = _capture_create_task(monkeypatch)
    resp = await auth_post(
        ready_kg_lpv, REPAIR_URL.format(job_id=job.id), teacher_user.id, json={"finding_ids": [finding.id]}
    )
    assert resp.status_code == 202
    await captured[0]

    resp2 = await auth_get(ready_kg_lpv, JOB_URL.format(job_id=job.id), teacher_user.id)
    assert resp2.json()["status"] == "repaired"

    resp3 = await auth_get(ready_kg_lpv, DIFF_URL.format(job_id=job.id), teacher_user.id)
    assert resp3.status_code == 200
    diffs = resp3.json()
    assert len(diffs) == 1
    assert diffs[0]["section_id"] == "khoi_dong"
    assert diffs[0]["before"] == "Nội dung gốc chưa đúng."
    assert diffs[0]["after"] == "Nội dung đã sửa đúng chuẩn."
    assert diffs[0]["findings_addressed"] == [finding.id]

    await db_session.refresh(finding)
    assert finding.status == "repaired"
    assert finding.repair_diff["section_id"] == "khoi_dong"
    assert finding.repair_diff["after"] == "Nội dung đã sửa đúng chuẩn."


# =========================== (b) Finding không hợp lệ bị từ chối sửa ===========================


@pytest.mark.asyncio
async def test_repair_refuses_unjudged_dismissed_and_empty_evidence(db_session, teacher_user, monkeypatch):
    mock_repair_llm = AsyncMock(return_value=({"after": "x"}, 5))
    monkeypatch.setattr(repairer, "generate_json", mock_repair_llm)

    sections = [{"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Nội dung."}]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(
        user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100,
        segments=SegmentedPlan().model_dump(mode="json"),
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    f_unjudged = KgLpvFinding(
        job_id=job.id, code="M2", branch="N2", section_id="muc_tieu",
        evidence=[{"a": 1}], explanation="x", status="unjudged",
    )
    f_dismissed = KgLpvFinding(
        job_id=job.id, code="M1", branch="N2", section_id="muc_tieu",
        evidence=[{"a": 1}], explanation="x", status="dismissed",
    )
    f_open_no_evidence = KgLpvFinding(
        job_id=job.id, code="M3", branch="N2", section_id="muc_tieu",
        evidence=[], explanation="x", status="open",
    )
    db_session.add_all([f_unjudged, f_dismissed, f_open_no_evidence])
    await db_session.commit()
    for f in (f_unjudged, f_dismissed, f_open_no_evidence):
        await db_session.refresh(f)

    diffs = await repair(db_session, job, [f_unjudged, f_dismissed, f_open_no_evidence])

    assert diffs == []
    mock_repair_llm.assert_not_called()
    assert f_unjudged.status == "unjudged"
    assert f_dismissed.status == "dismissed"
    assert f_open_no_evidence.status == "open"


# =========================== (c) Kiểm lại: pass -> repaired, fail -> reverified_fail ===========================


@pytest.mark.asyncio
async def test_repair_reverify_fail_keeps_diff_but_does_not_mark_repaired(db_session, teacher_user, monkeypatch):
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: LessonContext())
    monkeypatch.setattr(repairer, "generate_json", AsyncMock(return_value=({"after": "Nội dung sửa vẫn còn lỗi."}, 8)))
    # Re-verify M6 (N2) vẫn phán "khong_can_cu" -> re-verify FAIL
    monkeypatch.setattr(
        n2_curriculum, "generate_json",
        AsyncMock(return_value=(
            {"verdict": "khong_can_cu", "evidence_refs": [{"ma_dinh_danh": "MDKT-1"}], "explanation": "Vẫn thiếu căn cứ."},
            0,
        )),
    )

    sections = [{"section_id": "khoi_dong", "section_type": "khoi_dong", "title": "Khởi động", "content": "Nội dung gốc."}]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    segments = SegmentedPlan(
        objective_clauses=[],
        activity_components=[_act("khoi_dong__noi_dung", "noi_dung", "Nội dung gốc.", "khoi_dong")],
    ).model_dump(mode="json")
    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100, segments=segments)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M6", branch="N2", section_id="khoi_dong",
        evidence=[{"ma_dinh_danh": "MDKT-1"}], explanation="Kiến thức thiếu căn cứ.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    diffs = await repair(db_session, job, [finding])

    assert len(diffs) == 1
    assert diffs[0].after == "Nội dung sửa vẫn còn lỗi."
    await db_session.refresh(finding)
    assert finding.status == "reverified_fail"
    assert finding.repair_diff is not None  # bản sửa vẫn giữ lại để giáo viên xem, KHÔNG áp dụng

    # KHBD không bị đổi (repair() không bao giờ chạm SavedLessonPlan)
    await db_session.refresh(plan)
    assert plan.sections[0]["content"] == "Nội dung gốc."


# =========================== (c2) Kiểm lại: unjudged (LLM lỗi) KHÔNG tính là fail ===========================


@pytest.mark.asyncio
async def test_repair_reverify_unjudged_finding_does_not_fail_repair(db_session, teacher_user, monkeypatch):
    """Fix (final-review Finding 1): re-verify M6 gặp lỗi LLM (timeout/API lỗi) chỉ
    tạo finding `status="unjudged"` (không phán xử được, §9) — KHÔNG phải lỗi nội
    dung đã xác nhận. `_reverify` phải loại `unjudged` khỏi `relevant` trước khi
    tính `passed`; nếu không, finding đã sửa đúng sẽ bị đánh oan `reverified_fail`
    chỉ vì 1 lượt LLM hỏng khi kiểm lại (không liên quan chất lượng bản sửa)."""
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: LessonContext())
    monkeypatch.setattr(
        repairer, "generate_json",
        AsyncMock(return_value=({"after": "Nội dung đã sửa đúng chuẩn."}, 8)),
    )
    # Re-verify M6 (N2): LLM hỏng -> chỉ tạo finding "unjudged", KHÔNG phải lỗi xác nhận.
    monkeypatch.setattr(n2_curriculum, "generate_json", AsyncMock(side_effect=RuntimeError("LLM API lỗi tạm thời")))

    sections = [{"section_id": "khoi_dong", "section_type": "khoi_dong", "title": "Khởi động", "content": "Nội dung gốc chưa đúng."}]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    segments = SegmentedPlan(
        objective_clauses=[],
        activity_components=[_act("khoi_dong__noi_dung", "noi_dung", "Nội dung gốc chưa đúng.", "khoi_dong")],
    ).model_dump(mode="json")
    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100, segments=segments)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M6", branch="N2", section_id="khoi_dong",
        evidence=[{"ma_dinh_danh": "MDKT-1"}], explanation="Kiến thức thiếu căn cứ.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    diffs = await repair(db_session, job, [finding])

    assert len(diffs) == 1
    assert diffs[0].after == "Nội dung đã sửa đúng chuẩn."
    await db_session.refresh(finding)
    # unjudged khi kiểm lại KHÔNG được tính là fail -> finding vẫn "repaired", diff áp dụng được
    assert finding.status == "repaired"
    assert finding.repair_diff is not None


# =========================== (d) Đoạn phụ thuộc được kiểm lại ===========================


@pytest.mark.asyncio
async def test_repair_rechecks_dependent_activity_section_for_objective_edit(db_session, teacher_user, monkeypatch):
    lesson_ctx = LessonContext(
        yccd=[{"ma_dinh_danh": "YC1", "ten": "Trình bày được khái niệm mạng máy tính", "muc_nhan_thuc": {"bac": 1}}],
        dong_tu_nhan_thuc={"do_duoc": [{"dong_tu": "trình bày được", "bac": 1}], "khong_do_duoc": []},
    )
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: lesson_ctx)
    monkeypatch.setattr(
        repairer, "generate_json",
        AsyncMock(return_value=({"after": "Trình bày được khái niệm mạng máy tính chính xác hơn."}, 6)),
    )
    monkeypatch.setattr(
        n2_curriculum, "generate_json",
        AsyncMock(return_value=({"verdict": "do_duoc", "evidence_refs": [], "explanation": "OK"}, 0)),
    )
    mock_n3_llm = AsyncMock(return_value=(
        {"verdict": "khong_dat", "thanh_phan_thieu": "hanh_dong", "evidence_refs": [], "explanation": "Thiếu hành động đúng mức."},
        4,
    ))
    monkeypatch.setattr(n3_pedagogy, "generate_json", mock_n3_llm)

    sections = [
        {"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Trình bày được khái niệm mạng."},
        {"section_id": "hoat_dong_1", "section_type": "hinh_thanh_kien_thuc", "title": "Hoạt động 1", "content": "Nội dung hoạt động 1."},
    ]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    segments = SegmentedPlan(
        objective_clauses=[_obj("muc_tieu__1", "kien_thuc", "Trình bày được khái niệm mạng.")],
        activity_components=[
            _act("hd1__muc_tieu", "muc_tieu", "Trình bày được khái niệm mạng.", "hoat_dong_1"),
            _act("hd1__san_pham", "san_pham", "Bài trình bày của học sinh.", "hoat_dong_1"),
            _act("hd1__to_chuc", "to_chuc_thuc_hien", "Học sinh thảo luận nhóm.", "hoat_dong_1"),
        ],
    ).model_dump(mode="json")
    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100, segments=segments)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M1", branch="N2", section_id="muc_tieu",
        evidence=[{"ma_dinh_danh": "YC1"}], explanation="Mục tiêu kiến thức lệch yêu cầu cần đạt.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    diffs = await repair(db_session, job, [finding])

    assert len(diffs) == 1
    mock_n3_llm.assert_called()  # trục 3 đã chạy kiểm lại trên hoạt động phụ thuộc "hoat_dong_1"
    await db_session.refresh(finding)
    assert finding.status == "reverified_fail"  # hoạt động phụ thuộc vẫn còn lỗi trục 3 -> kiểm lại fail


# =========================== /apply: chỉ ghi đúng section đã duyệt ===========================


@pytest.mark.asyncio
async def test_apply_updates_only_approved_section(ready_kg_lpv, db_session, teacher_user):
    sections = [
        {"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Cũ 1"},
        {"section_id": "khoi_dong", "section_type": "khoi_dong", "title": "Khởi động", "content": "Cũ 2"},
    ]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="repaired", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    diff = {"section_id": "muc_tieu", "before": "Cũ 1", "after": "Mới 1", "findings_addressed": []}
    finding = KgLpvFinding(
        job_id=job.id, code="M1", branch="N2", section_id="muc_tieu",
        evidence=[{"a": 1}], explanation="x", status="repaired", repair_diff=diff,
    )
    db_session.add(finding)
    await db_session.commit()

    resp = await auth_post(ready_kg_lpv, APPLY_URL.format(job_id=job.id), teacher_user.id, json={})
    assert resp.status_code == 200
    assert resp.json()["section_ids"] == ["muc_tieu"]

    await db_session.refresh(plan)
    by_id = {s["section_id"]: s["content"] for s in plan.sections}
    assert by_id["muc_tieu"] == "Mới 1"
    assert by_id["khoi_dong"] == "Cũ 2"


# =========================== (e) Task 9: section nhiều mệnh đề không bị trộn khi kiểm lại ===========================


@pytest.mark.asyncio
async def test_repair_reverify_does_not_mask_second_broken_clause_in_multi_clause_section(
    db_session, teacher_user, monkeypatch
):
    """Correctness fix (carried từ review Task 8): 1 section `muc_tieu` có NHIỀU mệnh
    đề — sửa đúng 1 mệnh đề (clause1) KHÔNG được làm "biến mất" lỗi của mệnh đề còn
    lại (clause2, không nằm trong finding được sửa) khi kiểm lại. Nếu
    `_rebuild_segmented_plan` còn gán NGUYÊN VĂN section đã sửa cho MỌI clause (lỗi
    cũ), clause2 sẽ được đối chiếu M1 bằng văn bản đã BỊ TRỘN với clause1 (chứa đủ từ
    khớp YCCĐ nhờ clause1) -> PASS giả, che lấp lỗi thật. Với bản sửa (tách lại RIÊNG
    section qua segmenter khi có nhiều segment con), clause2 được đối chiếu bằng đúng
    văn bản của chính nó -> vẫn trượt M1 -> re-verify PHẢI fail."""
    yccd = {
        "ma_dinh_danh": "YCCD-1", "ten": "Trình bày khái niệm mạng máy tính",
        "muc_nhan_thuc": {"bac": 1},
    }
    lesson_ctx = LessonContext(yccd=[yccd])
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: lesson_ctx)

    monkeypatch.setattr(
        repairer, "generate_json",
        AsyncMock(return_value=(
            {"after": "Trình bày được khái niệm mạng máy tính. Thực hành lắp ráp máy tính để bàn."}, 6,
        )),
    )
    # An toàn cho M2 (LLM_JUDGE) của cả 2 mệnh đề — không phải trọng tâm test này.
    monkeypatch.setattr(
        n2_curriculum, "generate_json",
        AsyncMock(return_value=({"verdict": "do_duoc", "evidence_refs": [], "explanation": "OK"}, 0)),
    )
    monkeypatch.setattr(
        segmenter, "generate_json",
        AsyncMock(return_value=(
            {
                "objective_clauses": [
                    {
                        "segment_id": "muc_tieu__r1", "section_id": "muc_tieu", "loai": "kien_thuc",
                        "text": "Trình bày được khái niệm mạng máy tính.",
                    },
                    {
                        "segment_id": "muc_tieu__r2", "section_id": "muc_tieu", "loai": "kien_thuc",
                        "text": " Thực hành lắp ráp máy tính để bàn.",
                    },
                ],
                "activity_components": [],
            },
            5,
        )),
    )

    sections = [
        {
            "section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu",
            "content": "Biết khái niệm mạng. Thực hành lắp ráp máy tính để bàn.",
        },
    ]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD test", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    # 2 mệnh đề mục tiêu CÙNG section_id "muc_tieu" + 1 hoạt động (không thuộc chuỗi
    # tiến trình chuẩn, chỉ có thành phần muc_tieu) hiện thực hoá CẢ HAI mệnh đề — để
    # trục 1 (đứt chuỗi mục tiêu-hoạt động) không gây nhiễu kết quả, giữ test tập
    # trung đúng vào M1.
    segments = SegmentedPlan(
        objective_clauses=[
            _obj("muc_tieu__1", "kien_thuc", "Biết khái niệm mạng."),
            _obj("muc_tieu__2", "kien_thuc", "Thực hành lắp ráp máy tính để bàn."),
        ],
        activity_components=[
            _act(
                "hd_evidence__muc_tieu", "muc_tieu",
                "Trình bày được khái niệm mạng máy tính và thực hành lắp ráp máy tính để bàn.",
                "hd_evidence",
            ),
        ],
    ).model_dump(mode="json")
    job = KgLpvJob(
        user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100, segments=segments,
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M1", branch="N2", section_id="muc_tieu",
        evidence=[{"ma_dinh_danh": "YCCD-1"}], explanation="Mục tiêu kiến thức lệch yêu cầu cần đạt.",
        status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    diffs = await repair(db_session, job, [finding])

    assert len(diffs) == 1
    await db_session.refresh(finding)
    # clause2 ("Thực hành lắp ráp máy tính để bàn.") KHÔNG nằm trong finding được sửa,
    # vẫn trượt M1 khi được tách RIÊNG đúng -> kiểm lại phải fail, KHÔNG được coi là
    # "repaired" giả do bị trộn văn bản với clause1 đã sửa.
    assert finding.status == "reverified_fail"


@pytest.mark.asyncio
async def test_apply_non_owner_returns_404(ready_kg_lpv, db_session, roles):
    owner = await create_teacher(db_session, roles, email="owner-repair@test.com")
    other = await create_teacher(db_session, roles, email="other-repair@test.com")
    await db_session.commit()

    sections = [{"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Cũ"}]
    plan = SavedLessonPlan(user_id=owner.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=owner.id, saved_lesson_plan_id=plan.id, status="repaired", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    resp = await auth_post(ready_kg_lpv, APPLY_URL.format(job_id=job.id), other.id, json={})
    assert resp.status_code == 404


# =========================== (f) Task 1: explanation_override giáo viên ===========================


@pytest.mark.asyncio
async def test_repair_uses_explanation_override_when_present(db_session, teacher_user, monkeypatch):
    """`repair(..., overrides={finding.id: "..."})` phải dùng override thay cho
    `finding.explanation` gốc khi dựng prompt sửa."""
    monkeypatch.setattr(graph_client, "get_lesson_context", lambda lesson_id, grade: LessonContext())
    # An toàn: reverify M6 (N2) không được tạo finding mới ngoài ý muốn.
    monkeypatch.setattr(
        n2_curriculum, "generate_json",
        AsyncMock(return_value=({"verdict": "hop_le", "evidence_refs": [], "explanation": "OK"}, 0)),
    )

    captured = {}

    async def fake_generate_json(db, feature_key, prompt, **kwargs):
        captured["prompt"] = prompt
        return ({"after": "Nội dung đã sửa"}, 10)

    monkeypatch.setattr(repairer, "generate_json", fake_generate_json)

    sections = [
        {"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Mục tiêu gốc."},
        {"section_id": "khoi_dong", "section_type": "khoi_dong", "title": "Khởi động", "content": "Nội dung gốc chưa đúng."},
    ]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD test", content="noi dung", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    segments = SegmentedPlan(
        objective_clauses=[],
        activity_components=[_act("khoi_dong__noi_dung", "noi_dung", "Nội dung gốc chưa đúng.", "khoi_dong")],
    ).model_dump(mode="json")

    job = KgLpvJob(
        user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100, segments=segments,
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M6", branch="N2", section_id="khoi_dong",
        evidence=[{"ma_dinh_danh": "MDKT-1", "trich_dan": "..."}],
        explanation="Giải thích gốc.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    await repair(db_session, job, [finding], overrides={finding.id: "HÃY VIẾT LẠI THEO Ý GIÁO VIÊN"})

    assert "HÃY VIẾT LẠI THEO Ý GIÁO VIÊN" in captured["prompt"]
    assert "Giải thích gốc." not in captured["prompt"]


@pytest.mark.asyncio
async def test_repair_endpoint_accepts_findings_with_override(ready_kg_lpv, db_session, teacher_user, monkeypatch):
    """Body `{"findings": [{"id": .., "explanation_override": ".."}]}` phải được
    `RepairRequest` chấp nhận và endpoint lên lịch job nền (202)."""
    sections = [{"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Nội dung."}]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M1", branch="N2", section_id="muc_tieu",
        evidence=[{"a": 1}], explanation="Giải thích gốc.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    captured = _capture_create_task(monkeypatch)
    resp = await auth_post(
        ready_kg_lpv, REPAIR_URL.format(job_id=job.id), teacher_user.id,
        json={"findings": [{"id": finding.id, "explanation_override": "sửa theo ý tôi"}]},
    )
    assert resp.status_code == 202
    # Job nền chưa được chạy trong test này — đóng coroutine để tránh cảnh báo
    # "coroutine was never awaited" và rò rỉ tài nguyên.
    captured[0].close()


@pytest.mark.asyncio
async def test_repair_endpoint_empty_body_still_repairs_all_open_findings(
    ready_kg_lpv, db_session, teacher_user, monkeypatch
):
    """Tương thích ngược: body rỗng (không `finding_ids`, không `findings`) vẫn phải
    sửa tất cả finding `status="open"` của job (hành vi cũ không đổi)."""
    sections = [{"section_id": "muc_tieu", "section_type": "muc_tieu", "title": "Mục tiêu", "content": "Nội dung."}]
    plan = SavedLessonPlan(user_id=teacher_user.id, title="KHBD", content="c", sections=sections)
    db_session.add(plan)
    await db_session.commit()
    await db_session.refresh(plan)

    job = KgLpvJob(user_id=teacher_user.id, saved_lesson_plan_id=plan.id, status="done", progress=100)
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    finding = KgLpvFinding(
        job_id=job.id, code="M1", branch="N2", section_id="muc_tieu",
        evidence=[{"a": 1}], explanation="Giải thích gốc.", status="open",
    )
    db_session.add(finding)
    await db_session.commit()
    await db_session.refresh(finding)

    captured = _capture_create_task(monkeypatch)
    resp = await auth_post(ready_kg_lpv, REPAIR_URL.format(job_id=job.id), teacher_user.id, json={})
    assert resp.status_code == 202
    captured[0].close()


def test_repair_request_accepts_old_and_new_body_shapes():
    """`RepairRequest` phải chấp nhận body cũ (`finding_ids`), body mới (`findings`
    kèm `explanation_override`), và body rỗng (cả hai mặc định `[]`)."""
    from app.modules.kg_lpv.schemas import RepairRequest

    old_shape = RepairRequest.model_validate({"finding_ids": [1, 2]})
    assert old_shape.finding_ids == [1, 2]
    assert old_shape.findings == []

    new_shape = RepairRequest.model_validate(
        {"findings": [{"id": 3, "explanation_override": "sửa theo ý tôi"}]}
    )
    assert new_shape.findings[0].id == 3
    assert new_shape.findings[0].explanation_override == "sửa theo ý tôi"
    assert new_shape.finding_ids == []

    empty = RepairRequest.model_validate({})
    assert empty.finding_ids == []
    assert empty.findings == []
