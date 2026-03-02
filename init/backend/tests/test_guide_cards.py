"""Tests for guide cards endpoints (Module 13 - 5 test cases)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers.auth_helpers import auth_get, auth_put
from tests.helpers.factories import create_guide_card


GUIDE_CARDS_URL = "/api/v1/guide-cards"


# ---------- 13.1 Get Active Cards (Public) ----------
@pytest.mark.asyncio
async def test_get_active_cards(client: AsyncClient, db_session):
    await create_guide_card(db_session, card_key="card1", title="Card 1", sort_order=1, is_active=True)
    await create_guide_card(db_session, card_key="card2", title="Card 2", sort_order=2, is_active=True)
    await create_guide_card(db_session, card_key="card3", title="Card 3", sort_order=3, is_active=False)
    await db_session.commit()

    resp = await client.get(GUIDE_CARDS_URL)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Should only return active cards
    assert all(c.get("is_active", True) for c in data)
    assert len(data) >= 2


# ---------- 13.2 Admin Get All ----------
@pytest.mark.asyncio
async def test_admin_get_all(client: AsyncClient, admin_user, db_session):
    await create_guide_card(db_session, card_key="acard1", title="ACard 1", is_active=True)
    await create_guide_card(db_session, card_key="acard2", title="ACard 2", is_active=False)
    await db_session.commit()

    resp = await auth_get(client, f"{GUIDE_CARDS_URL}/admin/all", admin_user.id)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Should return both active and inactive
    assert len(data) >= 2


# ---------- 13.3 Admin Update Card ----------
@pytest.mark.asyncio
async def test_admin_update_card(client: AsyncClient, admin_user, db_session):
    card = await create_guide_card(db_session, card_key="ucard", title="Old Title")
    await db_session.commit()

    resp = await auth_put(client, f"{GUIDE_CARDS_URL}/admin/{card.id}", admin_user.id, json={
        "title": "New Title",
        "description": "Updated description",
    })
    assert resp.status_code == 200
    assert resp.json()["title"] == "New Title"


# ---------- 13.4 Admin Reorder Cards ----------
@pytest.mark.asyncio
async def test_admin_reorder(client: AsyncClient, admin_user, db_session):
    c1 = await create_guide_card(db_session, card_key="rcard1", title="R1", sort_order=1)
    c2 = await create_guide_card(db_session, card_key="rcard2", title="R2", sort_order=2)
    await db_session.commit()

    resp = await auth_put(client, f"{GUIDE_CARDS_URL}/admin/reorder", admin_user.id, json={
        "card_ids": [c2.id, c1.id],
    })
    assert resp.status_code == 200


# ---------- 13.5 Non Admin Update ----------
@pytest.mark.asyncio
async def test_non_admin_update(client: AsyncClient, teacher_user, db_session):
    card = await create_guide_card(db_session, card_key="nacard", title="No Access")
    await db_session.commit()

    resp = await auth_put(client, f"{GUIDE_CARDS_URL}/admin/{card.id}", teacher_user.id, json={
        "title": "Should Fail",
    })
    assert resp.status_code == 403
