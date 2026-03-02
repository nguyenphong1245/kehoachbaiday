"""Tests for classroom management endpoints (Module 4 - 7 test cases)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers.auth_helpers import auth_delete, auth_get, auth_patch, auth_post
from tests.helpers.factories import create_classroom, create_teacher, create_user, ensure_roles


CLASSROOMS_URL = "/api/v1/classrooms"


# ---------- 4.1 Create Classroom ----------
@pytest.mark.asyncio
async def test_create_classroom(client: AsyncClient, teacher_user):
    resp = await auth_post(
        client, CLASSROOMS_URL, teacher_user.id,
        json={"name": "10A1", "grade": "10", "school_year": "2025-2026"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "10A1"
    assert data["grade"] == "10"


# ---------- 4.2 Create Classroom Student Forbidden ----------
@pytest.mark.asyncio
async def test_create_classroom_student_forbidden(client: AsyncClient, student_user):
    resp = await auth_post(
        client, CLASSROOMS_URL, student_user.id,
        role_prefix="student_",
        json={"name": "10A2"},
    )
    assert resp.status_code == 403


# ---------- 4.3 List Classrooms ----------
@pytest.mark.asyncio
async def test_list_classrooms(client: AsyncClient, teacher_user, classroom):
    resp = await auth_get(client, CLASSROOMS_URL, teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert len(data["classrooms"]) >= 1


# ---------- 4.4 Get Classroom Detail ----------
@pytest.mark.asyncio
async def test_get_classroom_detail(client: AsyncClient, teacher_user, classroom):
    resp = await auth_get(client, f"{CLASSROOMS_URL}/{classroom.id}", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == classroom.id
    assert "students" in data
    assert "groups" in data


# ---------- 4.5 Get Classroom Other Teacher ----------
@pytest.mark.asyncio
async def test_get_classroom_other_teacher(client: AsyncClient, classroom, db_session: AsyncSession, roles):
    other_teacher = await create_teacher(db_session, roles, email="other@test.com")
    await db_session.commit()

    resp = await auth_get(client, f"{CLASSROOMS_URL}/{classroom.id}", other_teacher.id)
    assert resp.status_code == 403


# ---------- 4.6 Update Classroom ----------
@pytest.mark.asyncio
async def test_update_classroom(client: AsyncClient, teacher_user, classroom):
    resp = await auth_patch(
        client,
        f"{CLASSROOMS_URL}/{classroom.id}",
        teacher_user.id,
        json={"name": "10A1 - Updated", "school_year": "2026-2027"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "10A1 - Updated"


# ---------- 4.7 Delete Classroom ----------
@pytest.mark.asyncio
async def test_delete_classroom(client: AsyncClient, teacher_user, classroom):
    resp = await auth_delete(client, f"{CLASSROOMS_URL}/{classroom.id}", teacher_user.id)
    assert resp.status_code == 204
