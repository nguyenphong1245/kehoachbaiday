"""Tests for assignment management endpoints (Module 7 - 15 test cases)."""

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.work_session import GroupWorkSession, IndividualSubmission
from app.models.shared_worksheet import SharedWorksheet
from app.models.shared_quiz import SharedQuiz
from app.models.code_exercise import CodeExercise
from tests.helpers.auth_helpers import auth_delete, auth_get, auth_patch, auth_post, auth_put
from tests.helpers.factories import (
    create_assignment,
    create_class_student,
    create_classroom,
    create_student_group,
    create_user,
    ensure_roles,
)


ASSIGNMENTS_URL = "/api/v1/assignments"


async def _create_worksheet(db_session, user_id: int) -> SharedWorksheet:
    ws = SharedWorksheet(
        share_code="WS001",
        user_id=user_id,
        title="Phieu hoc tap 1",
        content="<p>Content</p>",
        questions=[{"id": "q1", "content": "Question 1"}],
    )
    db_session.add(ws)
    await db_session.flush()
    return ws


async def _create_quiz(db_session, user_id: int) -> SharedQuiz:
    quiz = SharedQuiz(
        share_code="QZ001",
        title="Quiz 1",
        content="Quiz content",
        questions=[{"question": "Q1?", "A": "a", "B": "b", "C": "c", "D": "d", "answer": "A"}],
        total_questions=1,
        creator_id=user_id,
    )
    db_session.add(quiz)
    await db_session.flush()
    return quiz


async def _create_code_exercise(db_session, user_id: int) -> CodeExercise:
    ex = CodeExercise(
        share_code="CE001",
        title="Code Exercise 1",
        problem_statement="Write hello world",
        test_cases=[{"input": "", "expected_output": "Hello World", "is_hidden": False}],
        creator_id=user_id,
    )
    db_session.add(ex)
    await db_session.flush()
    return ex


# ---------- 7.1 Create Assignment Worksheet ----------
@pytest.mark.asyncio
async def test_create_assignment_worksheet(client: AsyncClient, teacher_user, classroom, db_session):
    ws = await _create_worksheet(db_session, teacher_user.id)
    await db_session.commit()

    resp = await auth_post(client, ASSIGNMENTS_URL, teacher_user.id, json={
        "classroom_id": classroom.id,
        "content_type": "worksheet",
        "content_id": ws.id,
        "title": "Bai tap worksheet",
        "work_type": "individual",
    })
    assert resp.status_code == 201
    assert resp.json()["content_type"] == "worksheet"


# ---------- 7.2 Create Assignment Quiz ----------
@pytest.mark.asyncio
async def test_create_assignment_quiz(client: AsyncClient, teacher_user, classroom, db_session):
    quiz = await _create_quiz(db_session, teacher_user.id)
    await db_session.commit()

    resp = await auth_post(client, ASSIGNMENTS_URL, teacher_user.id, json={
        "classroom_id": classroom.id,
        "content_type": "quiz",
        "content_id": quiz.id,
        "title": "Bai tap quiz",
        "work_type": "individual",
    })
    assert resp.status_code == 201
    assert resp.json()["content_type"] == "quiz"


# ---------- 7.3 Create Assignment Code ----------
@pytest.mark.asyncio
async def test_create_assignment_code(client: AsyncClient, teacher_user, classroom, db_session):
    ex = await _create_code_exercise(db_session, teacher_user.id)
    await db_session.commit()

    resp = await auth_post(client, ASSIGNMENTS_URL, teacher_user.id, json={
        "classroom_id": classroom.id,
        "content_type": "code_exercise",
        "content_id": ex.id,
        "title": "Bai tap code",
        "work_type": "individual",
    })
    assert resp.status_code == 201
    assert resp.json()["content_type"] == "code_exercise"


# ---------- 7.4 Create Assignment Group Work ----------
@pytest.mark.asyncio
async def test_create_assignment_group_work(client: AsyncClient, teacher_user, classroom, db_session):
    ws = await _create_worksheet(db_session, teacher_user.id)
    await db_session.commit()

    resp = await auth_post(client, ASSIGNMENTS_URL, teacher_user.id, json={
        "classroom_id": classroom.id,
        "content_type": "worksheet",
        "content_id": ws.id,
        "title": "Bai tap nhom",
        "work_type": "group",
    })
    assert resp.status_code == 201
    assert resp.json()["work_type"] == "group"


# ---------- 7.5 Create Assignment With Due Date ----------
@pytest.mark.asyncio
async def test_create_assignment_with_due_date(client: AsyncClient, teacher_user, classroom, db_session):
    ws = await _create_worksheet(db_session, teacher_user.id)
    await db_session.commit()

    due = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    resp = await auth_post(client, ASSIGNMENTS_URL, teacher_user.id, json={
        "classroom_id": classroom.id,
        "content_type": "worksheet",
        "content_id": ws.id,
        "title": "Bai tap co han",
        "work_type": "individual",
        "due_date": due,
    })
    assert resp.status_code == 201
    assert resp.json()["due_date"] is not None


# ---------- 7.6 Create Assignment With Start At ----------
@pytest.mark.asyncio
async def test_create_assignment_with_start_at(client: AsyncClient, teacher_user, classroom, db_session):
    ws = await _create_worksheet(db_session, teacher_user.id)
    await db_session.commit()

    start = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    resp = await auth_post(client, ASSIGNMENTS_URL, teacher_user.id, json={
        "classroom_id": classroom.id,
        "content_type": "worksheet",
        "content_id": ws.id,
        "title": "Bai tap delayed",
        "work_type": "individual",
        "start_at": start,
    })
    assert resp.status_code == 201
    assert resp.json()["start_at"] is not None


# ---------- 7.7 List Assignments By Classroom ----------
@pytest.mark.asyncio
async def test_list_assignments_by_classroom(client: AsyncClient, teacher_user, classroom, assignment):
    resp = await auth_get(client, f"{ASSIGNMENTS_URL}/classroom/{classroom.id}", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1


# ---------- 7.8 Get Assignment Detail ----------
@pytest.mark.asyncio
async def test_get_assignment_detail(client: AsyncClient, teacher_user, assignment):
    resp = await auth_get(client, f"{ASSIGNMENTS_URL}/{assignment.id}", teacher_user.id)
    assert resp.status_code == 200
    assert resp.json()["id"] == assignment.id


# ---------- 7.9 Update Assignment ----------
@pytest.mark.asyncio
async def test_update_assignment(client: AsyncClient, teacher_user, assignment):
    resp = await auth_patch(
        client,
        f"{ASSIGNMENTS_URL}/{assignment.id}",
        teacher_user.id,
        json={"title": "Updated Title"},
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


# ---------- 7.10 Delete Assignment ----------
@pytest.mark.asyncio
async def test_delete_assignment(client: AsyncClient, teacher_user, classroom, db_session):
    a = await create_assignment(db_session, classroom, title="Delete me")
    await db_session.commit()

    resp = await auth_delete(client, f"{ASSIGNMENTS_URL}/{a.id}", teacher_user.id)
    assert resp.status_code == 204


# ---------- 7.11 Grade Individual ----------
@pytest.mark.asyncio
async def test_grade_individual(client: AsyncClient, teacher_user, classroom, db_session, roles):
    a = await create_assignment(db_session, classroom)
    student = await create_user(db_session, email="grade_s@test.com", roles=roles, role_names=["student"])
    cs = await create_class_student(db_session, classroom, student, full_name="Grade Student", student_code="GS001")

    sub = IndividualSubmission(
        assignment_id=a.id,
        student_id=cs.id,
        answers={"q1": "answer"},
        status="submitted",
    )
    db_session.add(sub)
    await db_session.commit()

    resp = await auth_put(
        client,
        f"{ASSIGNMENTS_URL}/{a.id}/grade",
        teacher_user.id,
        json={"submission_type": "individual", "submission_id": sub.id, "score": 8.5, "comment": "Good"},
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ---------- 7.12 Grade Group ----------
@pytest.mark.asyncio
async def test_grade_group(client: AsyncClient, teacher_user, classroom, db_session, roles):
    a = await create_assignment(db_session, classroom, work_type="group")
    student = await create_user(db_session, email="grpgrade@test.com", roles=roles, role_names=["student"])
    cs = await create_class_student(db_session, classroom, student, full_name="Grp Student", student_code="GG001")
    group = await create_student_group(db_session, classroom, name="Grade Group", member_student_ids=[cs.id])

    ws = GroupWorkSession(
        assignment_id=a.id,
        group_id=group.id,
        answers={"q1": "group answer"},
        status="submitted",
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_put(
        client,
        f"{ASSIGNMENTS_URL}/{a.id}/grade",
        teacher_user.id,
        json={"submission_type": "group", "submission_id": ws.id, "score": 9.0, "comment": "Excellent"},
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True


# ---------- 7.13 Grade Group Member ----------
@pytest.mark.asyncio
async def test_grade_group_member(client: AsyncClient, teacher_user, classroom, db_session, roles):
    a = await create_assignment(db_session, classroom, work_type="group")
    student = await create_user(db_session, email="memgrade@test.com", roles=roles, role_names=["student"])
    cs = await create_class_student(db_session, classroom, student, full_name="Member Grade", student_code="MG001")
    group = await create_student_group(db_session, classroom, name="Member Group", member_student_ids=[cs.id])

    ws = GroupWorkSession(
        assignment_id=a.id,
        group_id=group.id,
        answers={"q1": "answer"},
        status="submitted",
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_put(
        client,
        f"{ASSIGNMENTS_URL}/{a.id}/grade",
        teacher_user.id,
        json={"submission_type": "group_member", "submission_id": ws.id, "student_id": cs.id, "score": 7.5, "comment": "OK"},
    )
    assert resp.status_code == 200


# ---------- 7.14 Get Submissions ----------
@pytest.mark.asyncio
async def test_get_submissions(client: AsyncClient, teacher_user, assignment):
    resp = await auth_get(client, f"{ASSIGNMENTS_URL}/{assignment.id}/submissions", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert "work_type" in data
    assert "submissions" in data


# ---------- 7.15 Get Statistics ----------
@pytest.mark.asyncio
async def test_get_statistics(client: AsyncClient, teacher_user, classroom):
    resp = await auth_get(client, f"{ASSIGNMENTS_URL}/classroom/{classroom.id}/statistics", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert "lessons" in data or "student_ranking" in data or "total_students" in data
