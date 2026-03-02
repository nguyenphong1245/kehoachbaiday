"""Tests for shared worksheets endpoints (Module 10b - 7 test cases)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.shared_worksheet import SharedWorksheet
from tests.helpers.auth_helpers import auth_delete, auth_get, auth_patch, auth_post
from tests.helpers.factories import create_user, ensure_roles


WORKSHEETS_URL = "/api/v1/worksheets"


# ---------- 10.10 Create Worksheet ----------
@pytest.mark.asyncio
async def test_create_worksheet(client: AsyncClient, teacher_user):
    resp = await auth_post(client, f"{WORKSHEETS_URL}/share", teacher_user.id, json={
        "title": "Test Worksheet",
        "content": "<p>Worksheet content with questions</p>",
        "questions": [{"id": "q1", "content": "Question 1", "type": "text"}],
    })
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert "share_code" in data or "worksheet_id" in data or "id" in data


# ---------- 10.11 List My Worksheets ----------
@pytest.mark.asyncio
async def test_list_my_worksheets(client: AsyncClient, teacher_user, db_session):
    ws = SharedWorksheet(
        share_code="LSWS01", user_id=teacher_user.id,
        title="List WS", content="<p>C</p>",
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_get(client, f"{WORKSHEETS_URL}/my-worksheets", teacher_user.id)
    assert resp.status_code == 200
    data = resp.json()
    # May be list or paginated
    if isinstance(data, dict):
        assert "worksheets" in data
    else:
        assert isinstance(data, list)


# ---------- 10.12 Get Worksheet Detail ----------
@pytest.mark.asyncio
async def test_get_worksheet_detail(client: AsyncClient, teacher_user, db_session):
    ws = SharedWorksheet(
        share_code="DTWS01", user_id=teacher_user.id,
        title="Detail WS", content="<p>Detail</p>",
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_get(client, f"{WORKSHEETS_URL}/{ws.id}/detail", teacher_user.id)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Detail WS"


# ---------- 10.13 Update Worksheet ----------
@pytest.mark.asyncio
async def test_update_worksheet(client: AsyncClient, teacher_user, db_session):
    ws = SharedWorksheet(
        share_code="UPWS01", user_id=teacher_user.id,
        title="Old WS", content="<p>Old</p>",
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_patch(client, f"{WORKSHEETS_URL}/{ws.id}", teacher_user.id, json={"title": "Updated WS"})
    assert resp.status_code == 200


# ---------- 10.14 Delete Worksheet ----------
@pytest.mark.asyncio
async def test_delete_worksheet(client: AsyncClient, teacher_user, db_session):
    ws = SharedWorksheet(
        share_code="DLWS01", user_id=teacher_user.id,
        title="Delete WS", content="<p>Delete</p>",
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_delete(client, f"{WORKSHEETS_URL}/{ws.id}", teacher_user.id)
    assert resp.status_code in (200, 204)


# ---------- 10.15 Toggle Active ----------
@pytest.mark.asyncio
async def test_toggle_active(client: AsyncClient, teacher_user, db_session):
    ws = SharedWorksheet(
        share_code="TGWS01", user_id=teacher_user.id,
        title="Toggle WS", content="<p>Toggle</p>", is_active=True,
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_patch(client, f"{WORKSHEETS_URL}/{ws.id}/toggle-active", teacher_user.id)
    assert resp.status_code == 200


# ---------- 10.16 Get Responses ----------
@pytest.mark.asyncio
async def test_get_responses(client: AsyncClient, teacher_user, db_session):
    ws = SharedWorksheet(
        share_code="RPWS01", user_id=teacher_user.id,
        title="Response WS", content="<p>Response</p>",
    )
    db_session.add(ws)
    await db_session.commit()

    resp = await auth_get(client, f"{WORKSHEETS_URL}/{ws.id}/responses", teacher_user.id)
    assert resp.status_code == 200
