"""Tests for shared quizzes endpoints (Module 10a - 9 test cases)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.shared_quiz import SharedQuiz
from tests.helpers.auth_helpers import auth_delete, auth_get, auth_patch, auth_post
from tests.helpers.factories import create_user, ensure_roles


QUIZZES_URL = "/api/v1/quizzes"

SAMPLE_QUIZ = {
    "title": "Quiz Test",
    "description": "Test quiz",
    "questions": [
        {"question": "What is 1+1?", "A": "1", "B": "2", "C": "3", "D": "4", "answer": "B"},
        {"question": "What is 2+2?", "A": "3", "B": "4", "C": "5", "D": "6", "answer": "B"},
    ],
}


# ---------- 10.1 Create Quiz ----------
@pytest.mark.asyncio
async def test_create_quiz(client: AsyncClient, teacher_user):
    resp = await auth_post(client, QUIZZES_URL, teacher_user.id, json=SAMPLE_QUIZ)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data.get("share_code") is not None or data.get("quiz_id") is not None


# ---------- 10.2 Create Quiz Parse Text ----------
@pytest.mark.asyncio
async def test_create_quiz_parse_text(client: AsyncClient, teacher_user):
    """Create quiz from text content (parsed questions)."""
    resp = await auth_post(client, QUIZZES_URL, teacher_user.id, json={
        "title": "Parsed Quiz",
        "content": "Câu 1: What? A. a B. b C. c D. d Answer: A",
        "questions": [{"question": "What?", "A": "a", "B": "b", "C": "c", "D": "d", "answer": "A"}],
    })
    assert resp.status_code in (200, 201)


# ---------- 10.3 List My Quizzes ----------
@pytest.mark.asyncio
async def test_list_my_quizzes(client: AsyncClient, teacher_user, db_session):
    # Create a quiz directly in DB
    quiz = SharedQuiz(
        share_code="LQ001", title="List Quiz", content="c",
        questions=[{"question": "Q?", "A": "a", "B": "b", "C": "c", "D": "d", "answer": "A"}],
        total_questions=1, creator_id=teacher_user.id,
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await auth_get(client, f"{QUIZZES_URL}/my-quizzes", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1


# ---------- 10.4 Get Quiz Detail ----------
@pytest.mark.asyncio
async def test_get_quiz_detail(client: AsyncClient, teacher_user, db_session):
    quiz = SharedQuiz(
        share_code="QD001", title="Detail Quiz", content="c",
        questions=[{"question": "Q?", "A": "a", "B": "b", "C": "c", "D": "d", "answer": "A"}],
        total_questions=1, creator_id=teacher_user.id,
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await auth_get(client, f"{QUIZZES_URL}/{quiz.id}/detail", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Detail Quiz"
    assert "questions" in data


# ---------- 10.5 Update Quiz ----------
@pytest.mark.asyncio
async def test_update_quiz(client: AsyncClient, teacher_user, db_session):
    quiz = SharedQuiz(
        share_code="QU001", title="Old Title", content="c",
        questions=[{"question": "Q?", "A": "a", "B": "b", "C": "c", "D": "d", "answer": "A"}],
        total_questions=1, creator_id=teacher_user.id,
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await auth_patch(client, f"{QUIZZES_URL}/{quiz.id}", teacher_user.id, json={"title": "New Title"})
    assert resp.status_code == 200


# ---------- 10.6 Delete Quiz ----------
@pytest.mark.asyncio
async def test_delete_quiz(client: AsyncClient, teacher_user, db_session):
    quiz = SharedQuiz(
        share_code="QX001", title="Delete Me", content="c",
        questions=[], total_questions=0, creator_id=teacher_user.id,
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await auth_delete(client, f"{QUIZZES_URL}/{quiz.id}", teacher_user.id)
    assert resp.status_code in (200, 204)


# ---------- 10.7 Toggle Active ----------
@pytest.mark.asyncio
async def test_toggle_active(client: AsyncClient, teacher_user, db_session):
    quiz = SharedQuiz(
        share_code="QT001", title="Toggle Quiz", content="c",
        questions=[], total_questions=0, creator_id=teacher_user.id, is_active=True,
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await auth_patch(client, f"{QUIZZES_URL}/{quiz.id}/toggle-active", teacher_user.id)
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False


# ---------- 10.8 Get Responses ----------
@pytest.mark.asyncio
async def test_get_responses(client: AsyncClient, teacher_user, db_session):
    quiz = SharedQuiz(
        share_code="QR001", title="Response Quiz", content="c",
        questions=[], total_questions=0, creator_id=teacher_user.id,
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await auth_get(client, f"{QUIZZES_URL}/{quiz.id}/responses", teacher_user.id)
    assert resp.status_code == 200


# ---------- 10.9 Get Statistics ----------
@pytest.mark.asyncio
async def test_get_statistics(client: AsyncClient, teacher_user, db_session):
    quiz = SharedQuiz(
        share_code="QS001", title="Stats Quiz", content="c",
        questions=[{"question": "Q?", "A": "a", "B": "b", "C": "c", "D": "d", "answer": "A"}],
        total_questions=1, creator_id=teacher_user.id,
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await auth_get(client, f"{QUIZZES_URL}/{quiz.id}/statistics", teacher_user.id)
    assert resp.status_code == 200
