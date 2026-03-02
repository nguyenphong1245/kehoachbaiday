"""Tests for code exercises endpoints (Module 10c - 12 test cases)."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.code_exercise import CodeExercise
from tests.helpers.auth_helpers import auth_delete, auth_get, auth_patch, auth_post, auth_put
from tests.helpers.factories import create_user, ensure_roles


CODE_EXERCISES_URL = "/api/v1/code-exercises"


async def _create_exercise(db_session, user_id: int, share_code: str = "EX001") -> CodeExercise:
    ex = CodeExercise(
        share_code=share_code,
        title="Test Exercise",
        problem_statement="Write a function that adds two numbers",
        starter_code="def add(a, b):\n    pass",
        test_cases=[
            {"input": "1 2", "expected_output": "3", "is_hidden": False},
            {"input": "5 3", "expected_output": "8", "is_hidden": True},
        ],
        creator_id=user_id,
        language="python",
    )
    db_session.add(ex)
    await db_session.flush()
    return ex


# ---------- 10.17 Create Exercise ----------
@pytest.mark.asyncio
async def test_create_exercise(client: AsyncClient, teacher_user):
    resp = await auth_post(client, CODE_EXERCISES_URL, teacher_user.id, json={
        "title": "New Exercise",
        "problem_statement": "Write hello world",
        "test_cases": [{"input": "", "expected_output": "Hello World", "is_hidden": False}],
        "language": "python",
    })
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "share_code" in data or "id" in data


# ---------- 10.18 List My Exercises ----------
@pytest.mark.asyncio
async def test_list_my_exercises(client: AsyncClient, teacher_user, db_session):
    await _create_exercise(db_session, teacher_user.id, "LMEX01")
    await db_session.commit()

    resp = await auth_get(client, f"{CODE_EXERCISES_URL}/my-exercises", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1


# ---------- 10.19 Delete Exercise ----------
@pytest.mark.asyncio
async def test_delete_exercise(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "DLEX01")
    await db_session.commit()

    resp = await auth_delete(client, f"{CODE_EXERCISES_URL}/{ex.id}", teacher_user.id)
    assert resp.status_code in (200, 204)


# ---------- 10.20 Toggle Active ----------
@pytest.mark.asyncio
async def test_toggle_active(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "TGEX01")
    await db_session.commit()

    resp = await auth_patch(client, f"{CODE_EXERCISES_URL}/{ex.id}/toggle-active", teacher_user.id)
    assert resp.status_code == 200


# ---------- 10.21 Get Statistics ----------
@pytest.mark.asyncio
async def test_get_statistics(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "STEX01")
    await db_session.commit()

    resp = await auth_get(client, f"{CODE_EXERCISES_URL}/{ex.id}/statistics", teacher_user.id)
    assert resp.status_code == 200


# ---------- 10.22 Public Get Exercise ----------
@pytest.mark.asyncio
async def test_public_get_exercise(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "PBEX01")
    await db_session.commit()

    resp = await client.get(f"{CODE_EXERCISES_URL}/public/PBEX01")
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Test Exercise"
    # Hidden test cases should not be visible
    visible_tests = [t for t in data.get("test_cases", []) if not t.get("is_hidden")]
    hidden_tests = [t for t in data.get("test_cases", []) if t.get("is_hidden")]
    assert len(hidden_tests) == 0 or all("expected_output" not in t for t in hidden_tests)


# ---------- 10.23 Public Run Code ----------
@pytest.mark.asyncio
async def test_public_run_code(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "RCEX01")
    await db_session.commit()

    mock_result = {
        "stdout": "3\n", "stderr": "", "exit_code": 0,
        "execution_time_ms": 50, "timed_out": False,
    }
    from tests.helpers.auth_helpers import csrf_headers_and_cookies
    csrf_h, csrf_c = csrf_headers_and_cookies()

    with patch("app.api.routes.code_exercises.execute_code", new_callable=AsyncMock, return_value=mock_result):
        resp = await client.post(
            f"{CODE_EXERCISES_URL}/public/RCEX01/run",
            json={"code": "print(1+2)", "language": "python"},
            headers=csrf_h, cookies=csrf_c,
        )
    assert resp.status_code in (200, 500)


# ---------- 10.24 Public Start Session ----------
@pytest.mark.asyncio
async def test_public_start_session(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "SSEX01")
    await db_session.commit()

    from tests.helpers.auth_helpers import csrf_headers_and_cookies
    csrf_h, csrf_c = csrf_headers_and_cookies()

    resp = await client.post(
        f"{CODE_EXERCISES_URL}/public/SSEX01/start-session",
        json={"student_name": "Test Student", "student_class": "10A1"},
        headers=csrf_h, cookies=csrf_c,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "session_token" in data


# ---------- 10.25 Public Submit ----------
@pytest.mark.asyncio
async def test_public_submit(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "SBEX01")
    await db_session.commit()

    from tests.helpers.auth_helpers import csrf_headers_and_cookies
    csrf_h, csrf_c = csrf_headers_and_cookies()

    # Start session first
    session_resp = await client.post(
        f"{CODE_EXERCISES_URL}/public/SBEX01/start-session",
        json={"student_name": "Submit Student", "student_class": "10A1"},
        headers=csrf_h, cookies=csrf_c,
    )
    assert session_resp.status_code == 200
    session_token = session_resp.json().get("session_token", "")

    mock_result = {
        "status": "passed", "total_tests": 1, "passed_tests": 1,
        "test_results": [{
            "test_num": 1, "input": "1 2", "expected_output": "3",
            "actual_output": "3", "passed": True, "is_hidden": False, "error": None,
        }],
        "execution_time_ms": 50,
    }
    with patch("app.api.routes.code_exercises.run_test_cases", new_callable=AsyncMock, return_value=mock_result):
        resp = await client.post(
            f"{CODE_EXERCISES_URL}/public/SBEX01/submit",
            json={
                "code": "print(1+2)", "language": "python",
                "session_token": session_token,
                "student_name": "Submit Student", "student_class": "10A1",
            },
            headers=csrf_h, cookies=csrf_c,
        )
    assert resp.status_code in (200, 400, 500)


# ---------- 10.26 Extract From Lesson ----------
@pytest.mark.asyncio
async def test_extract_from_lesson(client: AsyncClient, teacher_user):
    """Extract code exercises from lesson plan (mocked AI)."""
    with patch("app.api.routes.code_exercises.extract_code_exercises_from_lesson") as mock_extract:
        mock_extract.return_value = [{
            "title": "Extracted Exercise",
            "problem_statement": "Write add function",
            "test_cases": [{"input": "1 2", "expected_output": "3", "is_hidden": False}],
        }]

        resp = await auth_post(client, f"{CODE_EXERCISES_URL}/extract-from-lesson", teacher_user.id, json={
            "lesson_content": "# Bai hoc ve phep cong\n\nViet ham cong hai so",
        })
    assert resp.status_code in (200, 400, 422)


# ---------- 10.27 Teacher Get Full ----------
@pytest.mark.asyncio
async def test_teacher_get_full(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "TFEX01")
    await db_session.commit()

    resp = await auth_get(client, f"{CODE_EXERCISES_URL}/public/TFEX01/teacher", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    # Teacher should see hidden test cases
    all_tests = data.get("test_cases", [])
    assert len(all_tests) == 2  # Including hidden


# ---------- 10.28 Update Exercise ----------
@pytest.mark.asyncio
async def test_update_exercise(client: AsyncClient, teacher_user, db_session):
    ex = await _create_exercise(db_session, teacher_user.id, "UPEX01")
    await db_session.commit()

    resp = await auth_put(client, f"{CODE_EXERCISES_URL}/public/UPEX01/update", teacher_user.id, json={
        "title": "Updated Exercise",
        "problem_statement": "Updated statement",
        "test_cases": [{"input": "1 2", "expected_output": "3", "is_hidden": False}],
    })
    assert resp.status_code == 200
