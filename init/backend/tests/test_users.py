"""Tests for user management endpoints (Module 3 - 13 test cases)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers.auth_helpers import auth_delete, auth_get, auth_post, auth_put
from tests.helpers.factories import create_admin, create_student_user, create_teacher, create_user, ensure_roles


USERS_URL = "/api/v1/users"


# ---------- 3.1 Get Users Admin Only ----------
@pytest.mark.asyncio
async def test_get_users_admin_only(client: AsyncClient, admin_user):
    resp = await auth_get(client, USERS_URL, admin_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1


# ---------- 3.2 Get Users Unauthorized ----------
@pytest.mark.asyncio
async def test_get_users_unauthorized(client: AsyncClient, teacher_user):
    resp = await auth_get(client, USERS_URL, teacher_user.id)
    assert resp.status_code == 403


# ---------- 3.3 Get User By ID ----------
@pytest.mark.asyncio
async def test_get_user_by_id(client: AsyncClient, teacher_user):
    resp = await auth_get(client, f"{USERS_URL}/{teacher_user.id}", teacher_user.id)
    assert resp.status_code == 200
    assert resp.json()["id"] == teacher_user.id


# ---------- 3.4 Get Own Profile ----------
@pytest.mark.asyncio
async def test_get_own_profile(client: AsyncClient, teacher_user):
    resp = await auth_get(client, f"{USERS_URL}/{teacher_user.id}/profile", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert "first_name" in data


# ---------- 3.5 Update Profile ----------
@pytest.mark.asyncio
async def test_update_profile(client: AsyncClient, teacher_user):
    resp = await auth_put(
        client,
        f"{USERS_URL}/{teacher_user.id}/profile",
        teacher_user.id,
        json={"first_name": "Nguyen", "last_name": "Van A"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["first_name"] == "Nguyen"
    assert data["last_name"] == "Van A"


# ---------- 3.6 Get Settings ----------
@pytest.mark.asyncio
async def test_get_settings(client: AsyncClient, teacher_user):
    resp = await auth_get(client, f"{USERS_URL}/{teacher_user.id}/settings", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert "theme" in data
    assert "language" in data


# ---------- 3.7 Update Settings ----------
@pytest.mark.asyncio
async def test_update_settings(client: AsyncClient, teacher_user):
    resp = await auth_put(
        client,
        f"{USERS_URL}/{teacher_user.id}/settings",
        teacher_user.id,
        json={"theme": "dark", "language": "vi"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["theme"] == "dark"
    assert data["language"] == "vi"


# ---------- 3.8 Change Password ----------
@pytest.mark.asyncio
async def test_change_password(client: AsyncClient, teacher_user):
    resp = await auth_post(
        client,
        f"{USERS_URL}/me/change-password",
        teacher_user.id,
        json={"old_password": "StrongPass1!", "new_password": "NewStrong1!"},
    )
    assert resp.status_code == 200


# ---------- 3.9 Change Password Wrong Old ----------
@pytest.mark.asyncio
async def test_change_password_wrong_old(client: AsyncClient, teacher_user):
    resp = await auth_post(
        client,
        f"{USERS_URL}/me/change-password",
        teacher_user.id,
        json={"old_password": "WrongOldPass1!", "new_password": "NewStrong1!"},
    )
    assert resp.status_code == 400


# ---------- 3.10 Assign Roles Admin ----------
@pytest.mark.asyncio
async def test_assign_roles_admin(client: AsyncClient, admin_user, teacher_user, roles):
    admin_role_id = roles["admin"].id
    resp = await auth_put(
        client,
        f"{USERS_URL}/{teacher_user.id}/roles",
        admin_user.id,
        json={"role_ids": [admin_role_id]},
    )
    assert resp.status_code == 200
    assigned_roles = [r["name"] for r in resp.json()["roles"]]
    assert "admin" in assigned_roles


# ---------- 3.11 Assign Roles Non Admin ----------
@pytest.mark.asyncio
async def test_assign_roles_non_admin(client: AsyncClient, teacher_user, roles):
    resp = await auth_put(
        client,
        f"{USERS_URL}/{teacher_user.id}/roles",
        teacher_user.id,
        json={"role_ids": [roles["admin"].id]},
    )
    assert resp.status_code == 403


# ---------- 3.12 Delete User Admin ----------
@pytest.mark.asyncio
async def test_delete_user_admin(client: AsyncClient, admin_user, db_session: AsyncSession, roles):
    target = await create_user(
        db_session, email="deleteme@test.com", roles=roles, role_names=["teacher"]
    )
    await db_session.commit()

    resp = await auth_delete(client, f"{USERS_URL}/{target.id}", admin_user.id)
    assert resp.status_code == 200


# ---------- 3.13 Delete Self Prevention ----------
@pytest.mark.asyncio
async def test_delete_self_prevention(client: AsyncClient, admin_user):
    resp = await auth_delete(client, f"{USERS_URL}/{admin_user.id}", admin_user.id)
    assert resp.status_code == 400
