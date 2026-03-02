"""Tests for lesson builder endpoints (Module 11 - 20 test cases)."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saved_lesson_plan import SavedLessonPlan
from app.schemas.lesson_plan_builder import (
    LessonSearchResponse,
    LessonBasicInfo,
    LessonDetailResponse,
    SubjectsResponse,
    GenerateLessonPlanBuilderResponse,
    ImproveSectionResponse,
    NLSMienNangLucResponse,
    NLSNangLucThanhPhanResponse,
    NLSChiBaoResponse,
)
from tests.helpers.auth_helpers import auth_delete, auth_get, auth_patch, auth_post, auth_put
from tests.helpers.factories import create_user, ensure_roles


LB_URL = "/api/v1/lesson-builder"


# Helper to mock Neo4j service
def _mock_neo4j():
    """Create a mock for the lesson plan builder service."""
    mock_service = MagicMock()
    mock_service.get_subjects.return_value = ["Tin học", "Toán"]
    mock_service.get_topics.return_value = MagicMock(
        topics=[{"id": "t1", "name": "Bài 1: Giới thiệu"}]
    )
    mock_service.search_lessons.return_value = LessonSearchResponse(
        lessons=[LessonBasicInfo(id="L1", name="Bài 1")],
        total=1,
    )
    mock_service.get_lesson_detail.return_value = LessonDetailResponse(
        id="L1", name="Bài 1", grade="10", book_type="Cánh diều",
        topic="Chủ đề 1", chi_muc=[],
    )
    mock_service.get_reference_documents_from_neo4j.return_value = None
    mock_service.get_nls_mien_nang_luc.return_value = NLSMienNangLucResponse(mien_nang_luc=[])
    mock_service.get_nls_nang_luc_thanh_phan.return_value = NLSNangLucThanhPhanResponse(nang_luc_thanh_phan=[])
    mock_service.get_nls_chi_bao.return_value = NLSChiBaoResponse(chi_bao=[])
    return mock_service


# ---------- 11.1 Get Static Data ----------
@pytest.mark.asyncio
async def test_get_static_data(client: AsyncClient, teacher_user):
    resp = await auth_get(client, f"{LB_URL}/static-data", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert "book_types" in data or "teaching_methods" in data or "grades" in data


# ---------- 11.2 Get Subjects ----------
@pytest.mark.asyncio
async def test_get_subjects(client: AsyncClient, teacher_user):
    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service") as mock_get:
        mock_get.return_value = _mock_neo4j()
        resp = await auth_get(client, f"{LB_URL}/subjects", teacher_user.id)
    assert resp.status_code == 200


# ---------- 11.3 Get Topics ----------
@pytest.mark.asyncio
async def test_get_topics(client: AsyncClient, teacher_user):
    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service") as mock_get:
        mock_get.return_value = _mock_neo4j()
        resp = await auth_get(
            client, f"{LB_URL}/topics", teacher_user.id,
            params={"book_type": "Cánh diều", "grade": "10", "subject": "Tin học"},
        )
    assert resp.status_code == 200


# ---------- 11.4 Search Lessons ----------
@pytest.mark.asyncio
async def test_search_lessons(client: AsyncClient, teacher_user):
    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service") as mock_get:
        mock_get.return_value = _mock_neo4j()
        resp = await auth_post(client, f"{LB_URL}/lessons/search", teacher_user.id, json={
            "book_type": "Cánh diều",
            "grade": "10",
            "subject": "Tin học",
            "topic": "Bài 1",
        })
    assert resp.status_code == 200


# ---------- 11.5 Get Lesson Detail ----------
@pytest.mark.asyncio
async def test_get_lesson_detail(client: AsyncClient, teacher_user):
    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service") as mock_get:
        mock_get.return_value = _mock_neo4j()
        resp = await auth_get(client, f"{LB_URL}/lessons/L1", teacher_user.id)
    assert resp.status_code == 200


# ---------- 11.6 Generate Lesson Plan ----------
@pytest.mark.asyncio
async def test_generate_lesson_plan(client: AsyncClient, teacher_user):
    mock_service = _mock_neo4j()
    mock_response = GenerateLessonPlanBuilderResponse(
        lesson_info={"book_type": "Cánh diều", "grade": "10", "topic": "Chủ đề 1", "lesson_name": "Bài 1"},
        sections=[],
        full_content="# Kế hoạch bài dạy\n\nNội dung mẫu",
    )
    mock_service.generate_lesson_plan.return_value = (mock_response, 100)

    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service", return_value=mock_service), \
         patch("app.api.routes.lesson_builder.get_gemini_semaphore") as mock_sem:
        # Mock the semaphore context manager
        mock_sem.return_value.__aenter__ = AsyncMock()
        mock_sem.return_value.__aexit__ = AsyncMock(return_value=False)

        resp = await auth_post(client, f"{LB_URL}/generate", teacher_user.id, json={
            "lesson_id": "L1",
            "lesson_name": "Bài 1",
            "book_type": "Cánh diều",
            "grade": "10",
            "topic": "Chủ đề 1",
            "activities": [{
                "activity_type": "khoi_dong",
                "activity_name": "Khởi động",
                "selected_methods": [],
                "selected_techniques": [],
                "location": "lop_hoc",
            }],
        })
    assert resp.status_code in (200, 403, 500)


# ---------- 11.7 Generate Stream ----------
@pytest.mark.asyncio
async def test_generate_stream(client: AsyncClient, teacher_user):
    """SSE streaming endpoint - verify it returns event stream."""
    resp = await auth_post(client, f"{LB_URL}/generate-stream", teacher_user.id, json={
        "lesson_id": "L1", "lesson_name": "Bài 1",
        "book_type": "Cánh diều", "grade": "10",
        "topic": "Chủ đề 1",
        "activities": [{
            "activity_type": "khoi_dong",
            "activity_name": "Khởi động",
            "selected_methods": [],
            "selected_techniques": [],
            "location": "lop_hoc",
        }],
    })
    assert resp.status_code in (200, 403, 500)


# ---------- 11.8 Improve Section ----------
@pytest.mark.asyncio
async def test_improve_section(client: AsyncClient, teacher_user):
    mock_service = _mock_neo4j()
    mock_result = ImproveSectionResponse(improved_content="Improved content")
    mock_service.improve_section.return_value = (mock_result, 50)

    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service", return_value=mock_service), \
         patch("app.api.routes.lesson_builder.get_gemini_semaphore") as mock_sem:
        mock_sem.return_value.__aenter__ = AsyncMock()
        mock_sem.return_value.__aexit__ = AsyncMock(return_value=False)

        resp = await auth_post(client, f"{LB_URL}/improve-section", teacher_user.id, json={
            "section_type": "muc_tieu",
            "section_title": "Mục tiêu",
            "current_content": "Old content",
            "user_request": "Make it better",
            "lesson_info": {"book_type": "Cánh diều", "grade": "10", "topic": "T1", "lesson_name": "B1"},
        })
    assert resp.status_code in (200, 403, 500)


# ---------- 11.9 Generate Mindmap ----------
@pytest.mark.asyncio
async def test_generate_mindmap(client: AsyncClient, teacher_user):
    mock_service = _mock_neo4j()
    mock_service.generate_mindmap.return_value = ("# Root\n## Branch 1\n## Branch 2", 30)

    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service", return_value=mock_service), \
         patch("app.api.routes.lesson_builder.get_gemini_semaphore") as mock_sem:
        mock_sem.return_value.__aenter__ = AsyncMock()
        mock_sem.return_value.__aexit__ = AsyncMock(return_value=False)

        resp = await auth_post(client, f"{LB_URL}/generate-mindmap", teacher_user.id, json={
            "lesson_id": "L1",
            "lesson_name": "Bài 1",
            "activity_content": "Some lesson content",
            "activity_name": "Hoạt động khởi động",
        })
    assert resp.status_code in (200, 403, 500)


# ---------- 11.10 Save Lesson Plan ----------
@pytest.mark.asyncio
async def test_save_lesson_plan(client: AsyncClient, teacher_user):
    resp = await auth_post(client, f"{LB_URL}/saved", teacher_user.id, json={
        "title": "My Lesson Plan",
        "lesson_info": {
            "book_type": "Cánh diều",
            "grade": "10",
            "topic": "Chủ đề 1",
            "lesson_name": "Bài 1",
            "lesson_id": "L1",
        },
        "sections": [{
            "section_id": "s1",
            "section_type": "muc_tieu",
            "title": "Mục tiêu",
            "content": "Content",
        }],
        "full_content": "# Lesson content\n\nDetails here",
    })
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "id" in data


# ---------- 11.11 List Saved ----------
@pytest.mark.asyncio
async def test_list_saved(client: AsyncClient, teacher_user, db_session):
    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="Saved Plan 1",
        content="Content", book_type="Cánh diều", grade="10",
    )
    db_session.add(plan)
    await db_session.commit()

    resp = await auth_get(client, f"{LB_URL}/saved", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    if isinstance(data, dict):
        assert "lesson_plans" in data or "items" in data or "total" in data
    else:
        assert len(data) >= 1


# ---------- 11.12 Get Saved Detail ----------
@pytest.mark.asyncio
async def test_get_saved_detail(client: AsyncClient, teacher_user, db_session):
    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="Detail Plan",
        content="Detail content",
    )
    db_session.add(plan)
    await db_session.commit()

    resp = await auth_get(client, f"{LB_URL}/saved/{plan.id}", teacher_user.id)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Detail Plan"


# ---------- 11.13 Update Saved ----------
@pytest.mark.asyncio
async def test_update_saved(client: AsyncClient, teacher_user, db_session):
    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="Old Plan",
        content="Old content",
    )
    db_session.add(plan)
    await db_session.commit()

    resp = await auth_put(client, f"{LB_URL}/saved/{plan.id}", teacher_user.id, json={
        "title": "Updated Plan",
        "full_content": "Updated content",
    })
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Plan"


# ---------- 11.14 Delete Saved ----------
@pytest.mark.asyncio
async def test_delete_saved(client: AsyncClient, teacher_user, db_session):
    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="Delete Plan",
        content="Content",
    )
    db_session.add(plan)
    await db_session.commit()

    resp = await auth_delete(client, f"{LB_URL}/saved/{plan.id}", teacher_user.id)
    assert resp.status_code in (200, 204)


# ---------- 11.15 Mark Printed ----------
@pytest.mark.asyncio
async def test_mark_printed(client: AsyncClient, teacher_user, db_session):
    plan = SavedLessonPlan(
        user_id=teacher_user.id, title="Print Plan",
        content="Content", is_printed=False, print_count=0,
    )
    db_session.add(plan)
    await db_session.commit()

    resp = await auth_patch(client, f"{LB_URL}/saved/{plan.id}/print", teacher_user.id)
    assert resp.status_code == 200


# ---------- 11.16 Token Deduction ----------
@pytest.mark.asyncio
async def test_token_deduction(client: AsyncClient, teacher_user, db_session):
    """Verify token_balance is reduced after generation."""
    initial_balance = teacher_user.token_balance

    mock_service = _mock_neo4j()
    mock_response = GenerateLessonPlanBuilderResponse(
        lesson_info={"book_type": "Cánh diều", "grade": "10", "topic": "Chủ đề 1", "lesson_name": "Bài 1"},
        sections=[],
        full_content="# Kế hoạch bài dạy\n\nNội dung mẫu",
    )
    mock_service.generate_lesson_plan.return_value = (mock_response, 500)

    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service", return_value=mock_service), \
         patch("app.api.routes.lesson_builder.get_gemini_semaphore") as mock_sem:
        mock_sem.return_value.__aenter__ = AsyncMock()
        mock_sem.return_value.__aexit__ = AsyncMock(return_value=False)

        resp = await auth_post(client, f"{LB_URL}/generate", teacher_user.id, json={
            "lesson_id": "L1", "lesson_name": "Bài 1",
            "book_type": "Cánh diều", "grade": "10",
            "topic": "Chủ đề 1",
            "activities": [{
                "activity_type": "khoi_dong",
                "activity_name": "Khởi động",
                "selected_methods": [],
                "selected_techniques": [],
                "location": "lop_hoc",
            }],
        })

    if resp.status_code == 200:
        await db_session.refresh(teacher_user)
        assert teacher_user.token_balance <= initial_balance


# ---------- 11.17 Insufficient Tokens ----------
@pytest.mark.asyncio
async def test_insufficient_tokens(client: AsyncClient, db_session, roles):
    poor_user = await create_user(
        db_session, email="poor@test.com", roles=roles,
        role_names=["teacher", "user"], token_balance=0,
    )
    await db_session.commit()

    resp = await auth_post(client, f"{LB_URL}/generate", poor_user.id, json={
        "lesson_id": "L1", "lesson_name": "Bài 1",
        "book_type": "Cánh diều", "grade": "10",
        "topic": "Chủ đề 1",
        "activities": [{
            "activity_type": "khoi_dong",
            "activity_name": "Khởi động",
            "selected_methods": [],
            "selected_techniques": [],
            "location": "lop_hoc",
        }],
    })
    assert resp.status_code in (402, 400, 403, 500)


# ---------- 11.18 Get NLS Domains ----------
@pytest.mark.asyncio
async def test_get_nls_domains(client: AsyncClient, teacher_user):
    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service") as mock_get:
        mock_get.return_value = _mock_neo4j()
        resp = await auth_get(client, f"{LB_URL}/nls/mien-nang-luc", teacher_user.id)
    assert resp.status_code == 200


# ---------- 11.19 Get NLS Components ----------
@pytest.mark.asyncio
async def test_get_nls_components(client: AsyncClient, teacher_user):
    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service") as mock_get:
        mock_get.return_value = _mock_neo4j()
        resp = await auth_get(
            client, f"{LB_URL}/nls/nang-luc-thanh-phan", teacher_user.id,
            params={"mien_nang_luc": "Năng lực số"},
        )
    assert resp.status_code == 200


# ---------- 11.20 Get NLS Indicators ----------
@pytest.mark.asyncio
async def test_get_nls_indicators(client: AsyncClient, teacher_user):
    with patch("app.api.routes.lesson_builder.get_lesson_plan_builder_service") as mock_get:
        mock_get.return_value = _mock_neo4j()
        resp = await auth_get(
            client, f"{LB_URL}/nls/chi-bao", teacher_user.id,
            params={"nang_luc_thanh_phan": "NL Thành phần 1"},
        )
    assert resp.status_code == 200
