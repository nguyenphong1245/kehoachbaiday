"""
WebSocket Collaboration - Real-time cộng tác làm bài nhóm
"""
import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Set, Optional, Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_token
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.class_student import ClassStudent
from app.models.work_session import GroupWorkSession, GroupDiscussion
from app.models.student_group import GroupMember

router = APIRouter()
logger = logging.getLogger(__name__)


class CollaborationRoom:
    """Manages a single collaboration room (1 work session)"""

    def __init__(self, session_id: int):
        self.session_id = session_id
        self.connections: Dict[int, WebSocket] = {}  # user_id -> websocket
        self.user_names: Dict[int, str] = {}  # user_id -> display name
        self.state: Dict[str, Any] = {
            "answers": {},
            "task_assignments": {},
            "leader_id": None,
            "leader_votes": {},
        }
        self._flush_task: Optional[asyncio.Task] = None
        self._dirty = False

    async def load_state(self):
        """Load state from database"""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(GroupWorkSession).where(GroupWorkSession.id == self.session_id)
            )
            session = result.scalar_one_or_none()
            if session:
                self.state["answers"] = session.answers or {}
                self.state["task_assignments"] = session.task_assignments or {}
                self.state["leader_id"] = session.leader_id
                self.state["leader_votes"] = session.leader_votes or {}

    async def flush_to_db(self):
        """Persist current state to database"""
        if not self._dirty:
            return
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(GroupWorkSession).where(GroupWorkSession.id == self.session_id)
                )
                session = result.scalar_one_or_none()
                if session and session.status != "submitted":
                    session.answers = self.state["answers"]
                    session.task_assignments = self.state["task_assignments"]
                    session.leader_id = self.state["leader_id"]
                    session.leader_votes = self.state["leader_votes"]
                    await db.commit()
                    self._dirty = False
        except Exception as e:
            logger.error(f"Failed to flush session {self.session_id}: {e}")

    def start_periodic_flush(self):
        """Start background task to flush state every 10s"""
        if self._flush_task is None or self._flush_task.done():
            self._flush_task = asyncio.create_task(self._periodic_flush())

    async def _periodic_flush(self):
        try:
            while len(self.connections) > 0:
                await asyncio.sleep(10)
                await self.flush_to_db()
        except asyncio.CancelledError:
            await self.flush_to_db()

    def stop_periodic_flush(self):
        if self._flush_task and not self._flush_task.done():
            self._flush_task.cancel()

    async def broadcast(self, message: dict, exclude_user_id: Optional[int] = None):
        """Send message to all connected users in room"""
        data = json.dumps(message, ensure_ascii=False)
        disconnected = []
        for uid, ws in self.connections.items():
            if uid == exclude_user_id:
                continue
            try:
                await ws.send_text(data)
            except Exception:
                disconnected.append(uid)
        for uid in disconnected:
            self.connections.pop(uid, None)
            self.user_names.pop(uid, None)

    async def send_to(self, user_id: int, message: dict):
        ws = self.connections.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(message, ensure_ascii=False))
            except Exception as e:
                logger.debug("Failed to send WS message to user %d: %s", user_id, e)


# Global rooms registry
rooms: Dict[int, CollaborationRoom] = {}
rooms_last_activity: Dict[int, datetime] = {}  # Track last activity time for cleanup
_cleanup_task: Optional[asyncio.Task] = None


def get_or_create_room(session_id: int) -> CollaborationRoom:
    if session_id not in rooms:
        rooms[session_id] = CollaborationRoom(session_id)
    rooms_last_activity[session_id] = datetime.now(timezone.utc)
    return rooms[session_id]


def update_room_activity(session_id: int):
    """Update last activity timestamp for a room"""
    rooms_last_activity[session_id] = datetime.now(timezone.utc)


def cleanup_room(session_id: int):
    room = rooms.pop(session_id, None)
    rooms_last_activity.pop(session_id, None)
    if room:
        room.stop_periodic_flush()


async def broadcast_submission(session_id: int, submitter_user_id: int, submitter_name: str):
    """Broadcast submission notification to all room members.
    Called from submit_assignment endpoint after successful group submission.
    """
    room = rooms.get(session_id)
    if room:
        await room.broadcast({
            "type": "session_submitted",
            "submitter_user_id": submitter_user_id,
            "submitter_name": submitter_name,
            "message": f"{submitter_name} đã nộp bài cho nhóm",
        })


async def periodic_room_cleanup():
    """Cleanup stale rooms every 5 minutes (removes rooms inactive for >1 hour)"""
    global _cleanup_task
    CLEANUP_INTERVAL = 300  # 5 minutes
    STALE_THRESHOLD = 3600  # 1 hour

    while True:
        try:
            await asyncio.sleep(CLEANUP_INTERVAL)
            now = datetime.now(timezone.utc)
            stale_sessions = []

            for session_id, last_activity in list(rooms_last_activity.items()):
                room = rooms.get(session_id)
                # Check if room has no connections AND is stale
                if room and not room.connections:
                    age = (now - last_activity).total_seconds()
                    if age > STALE_THRESHOLD:
                        stale_sessions.append(session_id)

            for session_id in stale_sessions:
                logger.info("Cleaning up stale room session_id=%d", session_id)
                cleanup_room(session_id)

            if stale_sessions:
                logger.info("Cleaned up %d stale rooms, %d rooms remain", len(stale_sessions), len(rooms))

        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error("Error in room cleanup: %s", e)


def start_cleanup_task():
    """Start the background cleanup task if not already running"""
    global _cleanup_task
    if _cleanup_task is None or _cleanup_task.done():
        _cleanup_task = asyncio.create_task(periodic_room_cleanup())


async def authenticate_ws(websocket: WebSocket) -> Optional[int]:
    """Extract user_id from WebSocket query param or cookies"""
    # 1) Try query parameter token (from /auth/ws-token)
    token = websocket.query_params.get("token")

    # 2) Fallback to cookies
    if not token:
        cookies = websocket.cookies
        token = (
            cookies.get("student_access_token") or
            cookies.get("teacher_access_token") or
            cookies.get("access_token")
        )

    if not token:
        return None

    subject = verify_token(token)
    if not subject:
        return None

    try:
        return int(subject)
    except (ValueError, TypeError):
        return None


async def get_user_display_name(user_id: int) -> str:
    """Get user's display name"""
    async with AsyncSessionLocal() as db:
        # Try ClassStudent first for prettier name
        result = await db.execute(
            select(ClassStudent.full_name).where(ClassStudent.user_id == user_id)
        )
        name = result.scalar_one_or_none()
        if name:
            return name

        # Fallback to email
        result = await db.execute(
            select(User.email).where(User.id == user_id)
        )
        email = result.scalar_one_or_none()
        return email.split("@")[0] if email else f"User {user_id}"


async def verify_session_access(user_id: int, session_id: int) -> bool:
    """Verify user has access to this work session"""
    async with AsyncSessionLocal() as db:
        # Get the work session
        ws_result = await db.execute(
            select(GroupWorkSession).where(GroupWorkSession.id == session_id)
        )
        session = ws_result.scalar_one_or_none()
        if not session:
            return False

        # Check if user is in the group via group_members
        from app.models.class_assignment import ClassAssignment
        assignment_result = await db.execute(
            select(ClassAssignment.classroom_id).where(ClassAssignment.id == session.assignment_id)
        )
        classroom_id = assignment_result.scalar_one_or_none()
        if not classroom_id:
            return False

        # Get the student record
        student_result = await db.execute(
            select(ClassStudent.id).where(
                ClassStudent.user_id == user_id,
                ClassStudent.classroom_id == classroom_id,
            )
        )
        student_id = student_result.scalar_one_or_none()
        if not student_id:
            return False

        # Check group membership
        member_result = await db.execute(
            select(GroupMember.id).where(
                GroupMember.student_id == student_id,
                GroupMember.group_id == session.group_id,
            )
        )
        return member_result.scalar_one_or_none() is not None


@router.websocket("/ws/collaboration/{session_id}")
async def collaboration_ws(websocket: WebSocket, session_id: int):
    # Authenticate
    user_id = await authenticate_ws(websocket)
    if user_id is None:
        logger.warning("WS auth failed for session %s - no valid token found", session_id)
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "message": "Unauthorized"}))
        await websocket.close(code=4001, reason="Unauthorized")
        return

    logger.info("WS authenticated user_id=%s for session %s", user_id, session_id)

    # Verify access
    has_access = await verify_session_access(user_id, session_id)
    if not has_access:
        logger.warning("WS access denied user_id=%s session=%s", user_id, session_id)
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "message": "Không có quyền truy cập phiên này"}))
        await websocket.close(code=4003, reason="Forbidden")
        return

    await websocket.accept()

    # Get/create room
    room = get_or_create_room(session_id)

    # Start cleanup task if not running
    start_cleanup_task()

    # Load state if room is new
    if not room.connections:
        await room.load_state()

    # Add connection
    user_name = await get_user_display_name(user_id)
    room.connections[user_id] = websocket
    room.user_names[user_id] = user_name

    # Start periodic flush
    room.start_periodic_flush()

    # Get chat status for initial state
    chat_disabled = False
    chat_enabled = True
    async with AsyncSessionLocal() as db:
        ws_result = await db.execute(
            select(GroupWorkSession).where(GroupWorkSession.id == session_id)
        )
        ws = ws_result.scalar_one_or_none()
        if ws:
            chat_disabled = ws.chat_disabled
            from app.models.class_assignment import ClassAssignment
            a_result = await db.execute(
                select(ClassAssignment.chat_enabled).where(ClassAssignment.id == ws.assignment_id)
            )
            ce = a_result.scalar() if a_result else True
            chat_enabled = ce if ce is not None else True

    # Send current state to new user
    await room.send_to(user_id, {
        "type": "session_state",
        "answers": room.state["answers"],
        "task_assignments": room.state["task_assignments"],
        "leader_id": room.state["leader_id"],
        "leader_votes": room.state["leader_votes"],
        "chat_disabled": chat_disabled or not chat_enabled,
        "members_online": [
            {"user_id": uid, "name": name}
            for uid, name in room.user_names.items()
        ],
    })

    # Notify others
    await room.broadcast({
        "type": "member_joined",
        "user_id": user_id,
        "name": user_name,
        "members_online": [
            {"user_id": uid, "name": name}
            for uid, name in room.user_names.items()
        ],
    }, exclude_user_id=user_id)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")

            if msg_type == "answer_update":
                # Student updates an answer
                question_id = str(msg.get("question_id", ""))
                answer = msg.get("answer", "")
                room.state["answers"][question_id] = answer
                room._dirty = True
                update_room_activity(session_id)
                await room.broadcast({
                    "type": "answer_updated",
                    "question_id": question_id,
                    "answer": answer,
                    "user_id": user_id,
                    "user_name": user_name,
                }, exclude_user_id=user_id)

            elif msg_type == "chat_message":
                text = msg.get("message", "").strip()
                if text:
                    # Check chat permissions
                    async with AsyncSessionLocal() as db:
                        # Check assignment-level chat_enabled
                        ws_result = await db.execute(
                            select(GroupWorkSession).where(GroupWorkSession.id == session_id)
                        )
                        ws = ws_result.scalar_one_or_none()
                        if ws:
                            # Check per-group chat_disabled
                            if ws.chat_disabled:
                                await websocket.send_json({"type": "chat_blocked", "reason": "Chat đã bị tắt bởi giáo viên"})
                                continue
                            # Check assignment-level chat_enabled
                            from app.models.class_assignment import ClassAssignment
                            a_result = await db.execute(
                                select(ClassAssignment.chat_enabled).where(ClassAssignment.id == ws.assignment_id)
                            )
                            chat_enabled_val = a_result.scalar()
                            if chat_enabled_val is False:
                                await websocket.send_json({"type": "chat_blocked", "reason": "Chat đã bị tắt cho bài này"})
                                continue

                        discussion = GroupDiscussion(
                            work_session_id=session_id,
                            user_id=user_id,
                            message=text,
                        )
                        db.add(discussion)
                        await db.commit()
                        await db.refresh(discussion)

                        await room.broadcast({
                            "type": "chat_message",
                            "id": discussion.id,
                            "user_id": user_id,
                            "user_name": user_name,
                            "message": text,
                            "created_at": discussion.created_at.isoformat() if discussion.created_at else "",
                        })

            elif msg_type == "vote_leader":
                candidate_id = msg.get("candidate_id")
                if candidate_id is not None:
                    room.state["leader_votes"][str(user_id)] = candidate_id
                    room._dirty = True

                    # Count votes
                    vote_counts: Dict[int, int] = {}
                    for voter, candidate in room.state["leader_votes"].items():
                        vote_counts[candidate] = vote_counts.get(candidate, 0) + 1

                    # Check if majority elected
                    total_members = len(room.user_names)
                    for candidate, count in vote_counts.items():
                        if count > total_members / 2:
                            room.state["leader_id"] = candidate
                            room._dirty = True
                            await room.broadcast({
                                "type": "leader_elected",
                                "leader_id": candidate,
                                "votes": room.state["leader_votes"],
                            })
                            break
                    else:
                        await room.broadcast({
                            "type": "vote_update",
                            "votes": room.state["leader_votes"],
                        })

            elif msg_type == "assign_task":
                # Leader assigns questions to members
                if room.state["leader_id"] == user_id or room.state["leader_id"] is None:
                    task_assignments = msg.get("task_assignments", {})
                    room.state["task_assignments"] = task_assignments
                    room._dirty = True
                    await room.broadcast({
                        "type": "task_assigned",
                        "task_assignments": task_assignments,
                        "by_user_id": user_id,
                    }, exclude_user_id=user_id)

            elif msg_type == "typing_indicator":
                question_id = msg.get("question_id", "")
                await room.broadcast({
                    "type": "typing_indicator",
                    "user_id": user_id,
                    "user_name": user_name,
                    "question_id": question_id,
                }, exclude_user_id=user_id)

            elif msg_type == "run_result":
                # Broadcast test run results to all group members
                await room.broadcast({
                    "type": "run_result",
                    "user_id": user_id,
                    "user_name": user_name,
                    "result": msg.get("result"),
                    "error": msg.get("error"),
                })

            elif msg_type == "peer_review_comment":
                # Sync peer review comments in real-time
                question_id = msg.get("question_id", "")
                comment = msg.get("comment", "")
                await room.broadcast({
                    "type": "peer_review_comment",
                    "user_id": user_id,
                    "user_name": user_name,
                    "question_id": question_id,
                    "comment": comment,
                }, exclude_user_id=user_id)

            elif msg_type == "peer_review_score":
                # Sync peer review score in real-time (leader only)
                score = msg.get("score")
                await room.broadcast({
                    "type": "peer_review_score",
                    "user_id": user_id,
                    "user_name": user_name,
                    "score": score,
                }, exclude_user_id=user_id)

    except WebSocketDisconnect:
        logger.debug("WebSocket disconnected for user %d in session %d", user_id, session_id)
    except Exception as e:
        logger.error(f"WS error for user {user_id} in session {session_id}: {e}")
    finally:
        # Remove connection
        room.connections.pop(user_id, None)
        room.user_names.pop(user_id, None)

        # Notify others
        await room.broadcast({
            "type": "member_left",
            "user_id": user_id,
            "name": user_name,
            "members_online": [
                {"user_id": uid, "name": name}
                for uid, name in room.user_names.items()
            ],
        })

        # Cleanup room if empty
        if not room.connections:
            await room.flush_to_db()
            cleanup_room(session_id)
