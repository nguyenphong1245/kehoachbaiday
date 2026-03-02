"""Tests for group management in classrooms (Module 6 - 6 test cases)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers.auth_helpers import auth_delete, auth_get, auth_patch, auth_post
from tests.helpers.factories import (
    create_class_student,
    create_classroom,
    create_student_group,
    create_student_user,
    create_user,
    ensure_roles,
)


def _groups_url(classroom_id: int) -> str:
    return f"/api/v1/classrooms/{classroom_id}/groups"


def _auto_divide_url(classroom_id: int) -> str:
    return f"/api/v1/classrooms/{classroom_id}/groups/auto-divide"


async def _setup_students(db_session, classroom, roles, count=6):
    """Create multiple students enrolled in a classroom."""
    students = []
    for i in range(count):
        user = await create_user(
            db_session,
            email=f"student{i}@test.com",
            password=f"student{i}",
            roles=roles,
            role_names=["student"],
        )
        cs = await create_class_student(
            db_session, classroom, user,
            full_name=f"Student {i}",
            student_code=f"HS{i:03d}",
            student_number=i + 1,
        )
        students.append(cs)
    await db_session.flush()
    return students


# ---------- 6.1 Create Group ----------
@pytest.mark.asyncio
async def test_create_group(client: AsyncClient, teacher_user, classroom, class_student):
    resp = await auth_post(
        client,
        _groups_url(classroom.id),
        teacher_user.id,
        json={"name": "Nhom 1", "student_ids": [class_student.id]},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Nhom 1"
    assert len(data["members"]) == 1


# ---------- 6.2 Auto Divide Random ----------
@pytest.mark.asyncio
async def test_auto_divide_random(client: AsyncClient, teacher_user, classroom, db_session, roles):
    await _setup_students(db_session, classroom, roles, count=6)
    await db_session.commit()

    resp = await auth_post(
        client,
        _auto_divide_url(classroom.id),
        teacher_user.id,
        json={"num_groups": 2, "method": "random"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["groups"]) == 2


# ---------- 6.3 Auto Divide Sequential ----------
@pytest.mark.asyncio
async def test_auto_divide_sequential(client: AsyncClient, teacher_user, classroom, db_session, roles):
    await _setup_students(db_session, classroom, roles, count=6)
    await db_session.commit()

    resp = await auth_post(
        client,
        _auto_divide_url(classroom.id),
        teacher_user.id,
        json={"num_groups": 3, "method": "sequential"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["groups"]) == 3


# ---------- 6.4 Update Group ----------
@pytest.mark.asyncio
async def test_update_group(client: AsyncClient, teacher_user, classroom, db_session):
    group = await create_student_group(db_session, classroom, name="Old Name")
    await db_session.commit()

    resp = await auth_patch(
        client,
        f"{_groups_url(classroom.id)}/{group.id}",
        teacher_user.id,
        json={"name": "New Name"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


# ---------- 6.5 Delete Group ----------
@pytest.mark.asyncio
async def test_delete_group(client: AsyncClient, teacher_user, classroom, db_session):
    group = await create_student_group(db_session, classroom, name="Delete Me")
    await db_session.commit()

    resp = await auth_delete(
        client,
        f"{_groups_url(classroom.id)}/{group.id}",
        teacher_user.id,
    )
    assert resp.status_code == 204


# ---------- 6.6 Auto Divide Count ----------
@pytest.mark.asyncio
async def test_auto_divide_count(client: AsyncClient, teacher_user, classroom, db_session, roles):
    students = await _setup_students(db_session, classroom, roles, count=10)
    await db_session.commit()

    resp = await auth_post(
        client,
        _auto_divide_url(classroom.id),
        teacher_user.id,
        json={"num_groups": 4, "method": "sequential"},
    )
    assert resp.status_code == 200
    groups = resp.json()["groups"]
    assert len(groups) == 4
    # All students should be assigned
    total_members = sum(len(g["members"]) for g in groups)
    assert total_members == 10
