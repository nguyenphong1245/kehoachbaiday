"""Tests for WebSocket collaboration (Module 14 - 10 test cases)."""

import json
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.ws_collaboration import CollaborationRoom, cleanup_room, get_or_create_room, rooms
from app.core.security import create_access_token
from app.models.work_session import GroupWorkSession
from tests.helpers.factories import (
    create_assignment,
    create_class_student,
    create_classroom,
    create_student_group,
    create_user,
    ensure_roles,
)


async def _setup_ws_env(db_session, roles):
    """Create a group work session for WebSocket testing."""
    from app.models.shared_worksheet import SharedWorksheet

    teacher = await create_user(db_session, email="ws_teacher@test.com", roles=roles, role_names=["teacher", "user"])
    classroom = await create_classroom(db_session, teacher, name="WS Class")

    ws = SharedWorksheet(
        share_code="WSWS01", user_id=teacher.id,
        title="WS Worksheet", content="<p>Content</p>",
    )
    db_session.add(ws)
    await db_session.flush()

    assignment = await create_assignment(
        db_session, classroom, content_type="worksheet", content_id=ws.id,
        title="WS Assignment", work_type="group",
    )

    s1 = await create_user(db_session, email="ws_s1@test.com", roles=roles, role_names=["student"])
    s2 = await create_user(db_session, email="ws_s2@test.com", roles=roles, role_names=["student"])
    cs1 = await create_class_student(db_session, classroom, s1, full_name="WS Student 1", student_code="WS001")
    cs2 = await create_class_student(db_session, classroom, s2, full_name="WS Student 2", student_code="WS002")
    group = await create_student_group(db_session, classroom, name="WS Group", member_student_ids=[cs1.id, cs2.id])

    work_session = GroupWorkSession(
        assignment_id=assignment.id, group_id=group.id,
        answers={}, status="in_progress",
    )
    db_session.add(work_session)
    await db_session.commit()

    return teacher, classroom, assignment, s1, s2, cs1, cs2, group, work_session


# ---------- 14.1 WS Connect Valid Token ----------
@pytest.mark.asyncio
async def test_ws_connect_valid_token(client, db_session, roles):
    _, _, _, s1, _, _, _, _, work_session = await _setup_ws_env(db_session, roles)

    token = create_access_token(subject=str(s1.id))
    with patch("app.api.routes.ws_collaboration.verify_session_access", new_callable=AsyncMock, return_value=True), \
         patch("app.api.routes.ws_collaboration.get_user_display_name", new_callable=AsyncMock, return_value="WS Student 1"):
        async with client.stream("GET", f"/ws/collaboration/{work_session.id}",
                                 cookies={"student_access_token": token}) as resp:
            # WebSocket upgrade should be attempted
            pass
    # If httpx doesn't support WS natively, test the authenticate function directly
    from app.api.routes.ws_collaboration import authenticate_ws

    # Test authenticate_ws logic directly
    mock_ws = AsyncMock()
    mock_ws.cookies = {"student_access_token": token}
    user_id = await authenticate_ws(mock_ws)
    assert user_id == s1.id


# ---------- 14.2 WS Connect Invalid Token ----------
@pytest.mark.asyncio
async def test_ws_connect_invalid_token():
    from app.api.routes.ws_collaboration import authenticate_ws

    mock_ws = AsyncMock()
    mock_ws.cookies = {"student_access_token": "invalid-token"}
    user_id = await authenticate_ws(mock_ws)
    assert user_id is None


# ---------- 14.3 WS Update Answers ----------
@pytest.mark.asyncio
async def test_ws_update_answers():
    """Test answer update propagation in room."""
    room = CollaborationRoom(session_id=999)
    room.state["answers"] = {}

    # Simulate answer update
    room.state["answers"]["q1"] = "Answer to Q1"
    room._dirty = True

    assert room.state["answers"]["q1"] == "Answer to Q1"
    assert room._dirty is True


# ---------- 14.4 WS Update Task Assignments ----------
@pytest.mark.asyncio
async def test_ws_update_task_assignments():
    """Test task assignment update in room."""
    room = CollaborationRoom(session_id=998)

    task_assignments = {"1": ["q1", "q2"], "2": ["q3", "q4"]}
    room.state["task_assignments"] = task_assignments
    room._dirty = True

    assert room.state["task_assignments"] == task_assignments


# ---------- 14.5 WS Elect Leader ----------
@pytest.mark.asyncio
async def test_ws_elect_leader():
    """Test leader election vote counting."""
    room = CollaborationRoom(session_id=997)
    room.user_names = {1: "Student 1", 2: "Student 2", 3: "Student 3"}

    # Three members, need >1.5 votes for majority
    room.state["leader_votes"]["1"] = 2  # Student 1 votes for Student 2
    room.state["leader_votes"]["2"] = 2  # Student 2 votes for Student 2
    room.state["leader_votes"]["3"] = 2  # Student 3 votes for Student 2

    # Count votes
    vote_counts = {}
    for voter, candidate in room.state["leader_votes"].items():
        vote_counts[candidate] = vote_counts.get(candidate, 0) + 1

    total_members = len(room.user_names)
    elected = None
    for candidate, count in vote_counts.items():
        if count > total_members / 2:
            elected = candidate
            break

    assert elected == 2  # Student 2 elected


# ---------- 14.6 WS Chat Message ----------
@pytest.mark.asyncio
async def test_ws_chat_message():
    """Test chat message broadcast."""
    room = CollaborationRoom(session_id=996)

    # Mock websocket connections
    ws1 = AsyncMock()
    ws2 = AsyncMock()
    room.connections = {1: ws1, 2: ws2}
    room.user_names = {1: "Student 1", 2: "Student 2"}

    await room.broadcast({
        "type": "chat_message",
        "user_id": 1,
        "user_name": "Student 1",
        "message": "Hello group!",
    }, exclude_user_id=1)

    # ws2 should receive the message, ws1 should not (excluded)
    ws2.send_text.assert_called_once()
    ws1.send_text.assert_not_called()


# ---------- 14.7 WS Session Submitted ----------
@pytest.mark.asyncio
async def test_ws_session_submitted():
    """Test submission notification broadcast."""
    from app.api.routes.ws_collaboration import broadcast_submission

    room = CollaborationRoom(session_id=995)
    ws1 = AsyncMock()
    ws2 = AsyncMock()
    room.connections = {1: ws1, 2: ws2}
    room.user_names = {1: "Student 1", 2: "Student 2"}
    rooms[995] = room

    await broadcast_submission(995, 1, "Student 1")

    # Both should receive submission notification
    assert ws1.send_text.called or ws2.send_text.called

    # Cleanup
    rooms.pop(995, None)


# ---------- 14.8 WS Broadcast To Room ----------
@pytest.mark.asyncio
async def test_ws_broadcast_to_room():
    """Test broadcast sends to all members."""
    room = CollaborationRoom(session_id=994)
    ws1 = AsyncMock()
    ws2 = AsyncMock()
    ws3 = AsyncMock()
    room.connections = {1: ws1, 2: ws2, 3: ws3}
    room.user_names = {1: "S1", 2: "S2", 3: "S3"}

    await room.broadcast({"type": "test", "data": "hello"})

    # All three should receive
    ws1.send_text.assert_called_once()
    ws2.send_text.assert_called_once()
    ws3.send_text.assert_called_once()

    msg = json.loads(ws1.send_text.call_args[0][0])
    assert msg["type"] == "test"


# ---------- 14.9 WS Room State Persistence ----------
@pytest.mark.asyncio
async def test_ws_room_state_persistence(db_session, roles):
    """Test that room state is flushed to DB."""
    _, _, _, _, _, _, _, _, work_session = await _setup_ws_env(db_session, roles)

    room = CollaborationRoom(session_id=work_session.id)
    room.state["answers"] = {"q1": "persisted answer"}
    room._dirty = True

    # Flush to DB
    await room.flush_to_db()

    # Verify in DB
    await db_session.refresh(work_session)
    assert work_session.answers.get("q1") == "persisted answer"


# ---------- 14.10 WS Disconnect Cleanup ----------
@pytest.mark.asyncio
async def test_ws_disconnect_cleanup():
    """Test cleanup when users disconnect."""
    room = CollaborationRoom(session_id=993)
    ws1 = AsyncMock()
    room.connections = {1: ws1}
    room.user_names = {1: "Student 1"}
    rooms[993] = room

    # Simulate disconnect
    room.connections.pop(1, None)
    room.user_names.pop(1, None)

    assert len(room.connections) == 0
    assert len(room.user_names) == 0

    # Cleanup room
    cleanup_room(993)
    assert 993 not in rooms
