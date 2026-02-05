"""
API Routes cho Peer Review - Tráo bài & đánh giá chéo
"""
import logging
import random
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user, require_role, user_has_role
from app.models.user import User
from app.models.classroom import Classroom
from app.models.class_student import ClassStudent
from app.models.class_assignment import ClassAssignment
from app.models.student_group import StudentGroup, GroupMember
from app.models.work_session import GroupWorkSession, IndividualSubmission
from app.models.peer_review import PeerReviewRound, PeerReview
from app.models.shared_worksheet import SharedWorksheet

router = APIRouter()
logger = logging.getLogger(__name__)


# ==================== Schemas ====================

class PeerReviewSubmitRequest(BaseModel):
    comments: dict = Field(default_factory=dict)
    score: Optional[int] = Field(None, ge=1, le=10)


class PeerReviewInfo(BaseModel):
    id: int
    reviewer_id: int
    reviewee_id: int
    reviewer_type: str
    reviewer_user_name: Optional[str] = None
    comments: dict
    score: Optional[int]
    submitted_at: Optional[str] = None


class PeerReviewRoundInfo(BaseModel):
    id: int
    assignment_id: int
    status: str
    pairings: list
    total_reviews: int
    submitted_reviews: int
    activated_at: Optional[str] = None
    completed_at: Optional[str] = None


# ==================== Helpers ====================

async def _verify_teacher_assignment(assignment_id: int, user: User, db: AsyncSession) -> ClassAssignment:
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    cr_result = await db.execute(
        select(Classroom).where(Classroom.id == assignment.classroom_id)
    )
    classroom = cr_result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp")
    if classroom.teacher_id != user.id and not user_has_role(user, "admin"):
        raise HTTPException(status_code=403, detail="Không có quyền")
    return assignment


# ==================== Teacher Endpoints ====================

@router.post("/assignments/{assignment_id}/activate", response_model=PeerReviewRoundInfo)
async def activate_peer_review(
    assignment_id: int,
    current_user: User = Depends(require_role("teacher")),
    db: AsyncSession = Depends(get_db),
):
    """Kích hoạt tráo bài - tạo pairings (chỉ cho worksheet)"""
    assignment = await _verify_teacher_assignment(assignment_id, current_user, db)

    # Peer review only for worksheet
    if assignment.content_type != "worksheet":
        raise HTTPException(status_code=400, detail="Đánh giá chéo chỉ áp dụng cho phiếu bài tập (worksheet)")

    # Check if round already exists
    existing = await db.execute(
        select(PeerReviewRound).where(PeerReviewRound.assignment_id == assignment_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Đã có vòng đánh giá chéo cho bài này")

    now = datetime.now(timezone.utc)
    pairings = []
    reviews_to_create = []

    if assignment.work_type == "group":
        # Get submitted group sessions
        ws_result = await db.execute(
            select(GroupWorkSession)
            .where(
                GroupWorkSession.assignment_id == assignment_id,
                GroupWorkSession.status == "submitted",
            )
            .order_by(GroupWorkSession.id)
        )
        sessions = ws_result.scalars().all()
        if len(sessions) < 2:
            raise HTTPException(status_code=400, detail="Cần ít nhất 2 nhóm đã nộp bài")

        # Circular pairing: group 1→2, 2→3, ..., N→1
        for i, session in enumerate(sessions):
            next_session = sessions[(i + 1) % len(sessions)]
            pairings.append({
                "reviewer_id": session.id,
                "reviewee_id": next_session.id,
                "reviewer_group_id": session.group_id,
                "reviewee_group_id": next_session.group_id,
            })
            reviews_to_create.append(PeerReview(
                reviewer_id=session.id,
                reviewee_id=next_session.id,
                reviewer_type="group",
            ))
    else:
        # Individual: random pairing, no self-review
        sub_result = await db.execute(
            select(IndividualSubmission)
            .where(
                IndividualSubmission.assignment_id == assignment_id,
                IndividualSubmission.status == "submitted",
            )
        )
        submissions = sub_result.scalars().all()
        if len(submissions) < 2:
            raise HTTPException(status_code=400, detail="Cần ít nhất 2 bài nộp")

        # Shuffle and create circular pairing
        shuffled = list(submissions)
        random.shuffle(shuffled)
        for i, sub in enumerate(shuffled):
            next_sub = shuffled[(i + 1) % len(shuffled)]
            pairings.append({
                "reviewer_id": sub.id,
                "reviewee_id": next_sub.id,
                "reviewer_student_id": sub.student_id,
                "reviewee_student_id": next_sub.student_id,
            })
            reviews_to_create.append(PeerReview(
                reviewer_id=sub.id,
                reviewee_id=next_sub.id,
                reviewer_type="individual",
            ))

    # Create the round
    review_round = PeerReviewRound(
        assignment_id=assignment_id,
        status="active",
        pairings=pairings,
        activated_at=now,
    )
    db.add(review_round)
    await db.flush()

    # Create review records
    for review in reviews_to_create:
        review.round_id = review_round.id
        db.add(review)

    # Update assignment status
    assignment.peer_review_status = "active"

    await db.commit()
    await db.refresh(review_round)

    return PeerReviewRoundInfo(
        id=review_round.id,
        assignment_id=assignment_id,
        status=review_round.status,
        pairings=review_round.pairings or [],
        total_reviews=len(reviews_to_create),
        submitted_reviews=0,
        activated_at=review_round.activated_at.isoformat() if review_round.activated_at else None,
        completed_at=None,
    )


@router.get("/assignments/{assignment_id}/status", response_model=PeerReviewRoundInfo)
async def get_peer_review_status(
    assignment_id: int,
    current_user: User = Depends(require_role("teacher")),
    db: AsyncSession = Depends(get_db),
):
    """Xem tiến độ đánh giá"""
    await _verify_teacher_assignment(assignment_id, current_user, db)

    result = await db.execute(
        select(PeerReviewRound).where(PeerReviewRound.assignment_id == assignment_id)
    )
    review_round = result.scalar_one_or_none()
    if not review_round:
        raise HTTPException(status_code=404, detail="Chưa có vòng đánh giá chéo")

    # Count reviews
    total_result = await db.execute(
        select(func.count(PeerReview.id)).where(PeerReview.round_id == review_round.id)
    )
    total = total_result.scalar() or 0

    submitted_result = await db.execute(
        select(func.count(PeerReview.id)).where(
            PeerReview.round_id == review_round.id,
            PeerReview.submitted_at.isnot(None),
        )
    )
    submitted = submitted_result.scalar() or 0

    return PeerReviewRoundInfo(
        id=review_round.id,
        assignment_id=assignment_id,
        status=review_round.status,
        pairings=review_round.pairings or [],
        total_reviews=total,
        submitted_reviews=submitted,
        activated_at=review_round.activated_at.isoformat() if review_round.activated_at else None,
        completed_at=review_round.completed_at.isoformat() if review_round.completed_at else None,
    )


@router.post("/assignments/{assignment_id}/complete")
async def complete_peer_review(
    assignment_id: int,
    current_user: User = Depends(require_role("teacher")),
    db: AsyncSession = Depends(get_db),
):
    """Kết thúc vòng đánh giá"""
    assignment = await _verify_teacher_assignment(assignment_id, current_user, db)

    result = await db.execute(
        select(PeerReviewRound).where(PeerReviewRound.assignment_id == assignment_id)
    )
    review_round = result.scalar_one_or_none()
    if not review_round:
        raise HTTPException(status_code=404, detail="Chưa có vòng đánh giá chéo")

    review_round.status = "completed"
    review_round.completed_at = datetime.now(timezone.utc)
    assignment.peer_review_status = "completed"

    await db.commit()
    return {"message": "Đã kết thúc vòng đánh giá chéo"}


@router.get("/assignments/{assignment_id}/reviews")
async def get_all_reviews(
    assignment_id: int,
    current_user: User = Depends(require_role("teacher")),
    db: AsyncSession = Depends(get_db),
):
    """Xem tất cả reviews (giáo viên) - bao gồm tên nhóm cho group review"""
    await _verify_teacher_assignment(assignment_id, current_user, db)

    result = await db.execute(
        select(PeerReviewRound).where(PeerReviewRound.assignment_id == assignment_id)
    )
    review_round = result.scalar_one_or_none()
    if not review_round:
        return {"reviews": []}

    reviews_result = await db.execute(
        select(PeerReview)
        .where(PeerReview.round_id == review_round.id)
        .options(selectinload(PeerReview.reviewer_user))
    )
    reviews = reviews_result.scalars().all()

    # For group reviews, get group names from sessions
    session_ids = set()
    for r in reviews:
        if r.reviewer_type == "group":
            session_ids.add(r.reviewer_id)
            session_ids.add(r.reviewee_id)

    # Fetch session -> group name mapping
    session_to_group_name = {}
    if session_ids:
        sessions_result = await db.execute(
            select(GroupWorkSession)
            .where(GroupWorkSession.id.in_(session_ids))
            .options(selectinload(GroupWorkSession.group))
        )
        sessions = sessions_result.scalars().all()
        for s in sessions:
            if s.group:
                session_to_group_name[s.id] = s.group.group_name

    return {
        "reviews": [
            {
                "id": r.id,
                "reviewer_id": r.reviewer_id,
                "reviewee_id": r.reviewee_id,
                "reviewer_type": r.reviewer_type,
                "reviewer_user_name": r.reviewer_user.full_name if r.reviewer_user else None,
                "reviewer_group_name": session_to_group_name.get(r.reviewer_id) if r.reviewer_type == "group" else None,
                "reviewee_group_name": session_to_group_name.get(r.reviewee_id) if r.reviewer_type == "group" else None,
                "comments": r.comments or {},
                "score": r.score,
                "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            }
            for r in reviews
        ]
    }


# ==================== Student Endpoints ====================

@router.get("/my-review/{assignment_id}")
async def get_my_review_task(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Xem bài cần chấm (student/teacher có thể xem)"""
    # Get assignment
    assignment_result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = assignment_result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    # Get student record
    student_result = await db.execute(
        select(ClassStudent).where(
            ClassStudent.user_id == current_user.id,
            ClassStudent.classroom_id == assignment.classroom_id,
        )
    )
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=403, detail="Không thuộc lớp này")

    # Get review round
    round_result = await db.execute(
        select(PeerReviewRound).where(
            PeerReviewRound.assignment_id == assignment_id,
            PeerReviewRound.status == "active",
        )
    )
    review_round = round_result.scalar_one_or_none()

    # Get group info for waiting room (even when no review round yet)
    group_info = None
    work_session_id = None
    if assignment.work_type == "group":
        # Find work session for this student's group - this preserves the members from when they did the assignment
        # First find the student's group membership
        group_member_result = await db.execute(
            select(GroupMember)
            .where(GroupMember.student_id == student.id)
            .options(selectinload(GroupMember.group))
        )
        my_membership = group_member_result.scalar_one_or_none()
        logger.info(f"Peer review - student {student.id} membership: {my_membership}")

        if my_membership and my_membership.group:
            my_group = my_membership.group
            logger.info(f"Peer review - found group {my_group.id} ({my_group.name})")

            # Get work session
            ws_result = await db.execute(
                select(GroupWorkSession).where(
                    GroupWorkSession.assignment_id == assignment_id,
                    GroupWorkSession.group_id == my_group.id,
                )
            )
            work_session = ws_result.scalar_one_or_none()
            logger.info(f"Peer review - work session: {work_session}")

            if work_session:
                leader_id = work_session.leader_id
                work_session_id = work_session.id
                is_leader = (leader_id == student.id) if leader_id else False
                logger.info(f"Peer review - leader_id: {leader_id}, is_leader: {is_leader}")

                # Get members separately with explicit eager loading
                members_result = await db.execute(
                    select(GroupMember)
                    .where(GroupMember.group_id == my_group.id)
                    .options(selectinload(GroupMember.student))
                )
                members = members_result.scalars().all()
                logger.info(f"Peer review - found {len(members)} members")

                member_list = []
                for m in members:
                    member_info = {
                        "student_id": m.student_id,
                        "user_id": m.student.user_id if m.student else None,
                        "full_name": m.student.full_name if m.student else "Unknown",
                        "is_leader": (leader_id == m.student_id) if leader_id else False,
                    }
                    logger.info(f"Peer review - member: {member_info}")
                    member_list.append(member_info)

                group_info = {
                    "group_id": my_group.id,
                    "group_name": my_group.name,
                    "is_leader": is_leader,
                    "work_session_id": work_session_id,
                    "members": member_list
                }
                logger.info(f"Peer review - group_info built successfully")
            else:
                logger.warning(f"Peer review - no work session found for assignment {assignment_id} group {my_group.id}")

    if not review_round:
        return {"review": None, "reviewee_answers": None, "questions": None, "group_info": group_info, "message": "Chưa có vòng đánh giá"}

    # Find the review assigned to this student
    # For group: find the group work session, then the review where reviewer_id = session.id
    # For individual: find the individual submission, then the review where reviewer_id = submission.id
    my_review = None
    reviewee_answers = None

    if assignment.work_type == "group":
        # Find my group's work session
        group_member_result = await db.execute(
            select(GroupMember.group_id).where(GroupMember.student_id == student.id)
        )
        group_ids = [r for r in group_member_result.scalars().all()]

        ws_result = await db.execute(
            select(GroupWorkSession).where(
                GroupWorkSession.assignment_id == assignment_id,
                GroupWorkSession.group_id.in_(group_ids),
            )
        )
        my_session = ws_result.scalar_one_or_none()

        if my_session:
            review_result = await db.execute(
                select(PeerReview).where(
                    PeerReview.round_id == review_round.id,
                    PeerReview.reviewer_id == my_session.id,
                )
            )
            my_review = review_result.scalar_one_or_none()

            if my_review:
                # Get the reviewee's answers
                reviewee_ws = await db.execute(
                    select(GroupWorkSession).where(GroupWorkSession.id == my_review.reviewee_id)
                )
                reviewee_session = reviewee_ws.scalar_one_or_none()
                if reviewee_session:
                    reviewee_answers = reviewee_session.answers or {}

                    # Set the reviewer_user_id if not set
                    if not my_review.reviewer_user_id:
                        my_review.reviewer_user_id = current_user.id
                        await db.commit()
    else:
        # Individual
        sub_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.assignment_id == assignment_id,
                IndividualSubmission.student_id == student.id,
            )
        )
        my_submission = sub_result.scalar_one_or_none()

        if my_submission:
            review_result = await db.execute(
                select(PeerReview).where(
                    PeerReview.round_id == review_round.id,
                    PeerReview.reviewer_id == my_submission.id,
                )
            )
            my_review = review_result.scalar_one_or_none()

            if my_review:
                reviewee_sub = await db.execute(
                    select(IndividualSubmission).where(IndividualSubmission.id == my_review.reviewee_id)
                )
                reviewee = reviewee_sub.scalar_one_or_none()
                if reviewee:
                    reviewee_answers = reviewee.answers or {}

                if not my_review.reviewer_user_id:
                    my_review.reviewer_user_id = current_user.id
                    await db.commit()

    if not my_review:
        return {"review": None, "reviewee_answers": None, "questions": None, "group_info": group_info, "message": "Không tìm thấy bài cần chấm"}

    # Get the worksheet questions and content if content_type is worksheet
    questions = None
    worksheet_content = None
    if assignment.content_type == "worksheet":
        ws_result = await db.execute(
            select(SharedWorksheet).where(SharedWorksheet.id == assignment.content_id)
        )
        worksheet = ws_result.scalar_one_or_none()
        if worksheet:
            questions = worksheet.questions or []
            worksheet_content = worksheet.content  # Raw markdown content

    return {
        "review": {
            "id": my_review.id,
            "reviewer_id": my_review.reviewer_id,
            "reviewee_id": my_review.reviewee_id,
            "reviewer_type": my_review.reviewer_type,
            "comments": my_review.comments or {},
            "score": my_review.score,
            "submitted_at": my_review.submitted_at.isoformat() if my_review.submitted_at else None,
        },
        "reviewee_answers": reviewee_answers,
        "questions": questions,
        "worksheet_content": worksheet_content,
        "group_info": group_info,
    }


@router.post("/{review_id}/submit")
async def submit_peer_review(
    review_id: int,
    data: PeerReviewSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Nộp nhận xét + điểm (chỉ nhóm trưởng được nộp cho bài nhóm)"""
    result = await db.execute(
        select(PeerReview)
        .where(PeerReview.id == review_id)
        .options(selectinload(PeerReview.round))
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài chấm")

    if review.submitted_at:
        raise HTTPException(status_code=400, detail="Bài chấm đã được nộp")

    # Get the assignment to check work_type
    assignment_result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == review.round.assignment_id)
    )
    assignment = assignment_result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    # Get student record
    student_result = await db.execute(
        select(ClassStudent).where(
            ClassStudent.user_id == current_user.id,
            ClassStudent.classroom_id == assignment.classroom_id,
        )
    )
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=403, detail="Không thuộc lớp này")

    # For group assignments, only leader can submit
    if assignment.work_type == "group" and review.reviewer_type == "group":
        # Find the student's group membership
        group_member_result = await db.execute(
            select(GroupMember).where(GroupMember.student_id == student.id)
        )
        membership = group_member_result.scalar_one_or_none()

        if not membership:
            raise HTTPException(status_code=403, detail="Bạn không thuộc nhóm nào")

        # Get the work session to check leader_id (leader is stored in work session, not group member)
        ws_result = await db.execute(
            select(GroupWorkSession).where(
                GroupWorkSession.assignment_id == assignment.id,
                GroupWorkSession.group_id == membership.group_id,
            )
        )
        work_session = ws_result.scalar_one_or_none()
        if not work_session:
            raise HTTPException(status_code=403, detail="Không tìm thấy phiên làm việc")

        is_leader = work_session.leader_id == student.id
        if not is_leader:
            raise HTTPException(status_code=403, detail="Chỉ nhóm trưởng mới được nộp đánh giá")

    # Verify this user is the reviewer (for individual)
    if review.reviewer_user_id and review.reviewer_user_id != current_user.id:
        # For group reviews, multiple users can access the same review
        if review.reviewer_type != "group":
            raise HTTPException(status_code=403, detail="Không phải người chấm bài này")

    review.comments = data.comments
    review.score = data.score
    review.submitted_at = datetime.now(timezone.utc)
    review.reviewer_user_id = current_user.id

    await db.commit()
    return {"message": "Đã nộp nhận xét"}


@router.get("/my-feedback/{assignment_id}")
async def get_my_feedback(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Xem nhận xét nhận được (student/teacher có thể xem)"""
    assignment_result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = assignment_result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    student_result = await db.execute(
        select(ClassStudent).where(
            ClassStudent.user_id == current_user.id,
            ClassStudent.classroom_id == assignment.classroom_id,
        )
    )
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=403, detail="Không thuộc lớp này")

    round_result = await db.execute(
        select(PeerReviewRound).where(PeerReviewRound.assignment_id == assignment_id)
    )
    review_round = round_result.scalar_one_or_none()
    if not review_round:
        return {"feedback": []}

    # Find reviews where I am the reviewee
    my_session_id = None
    if assignment.work_type == "group":
        group_member_result = await db.execute(
            select(GroupMember.group_id).where(GroupMember.student_id == student.id)
        )
        group_ids = list(group_member_result.scalars().all())

        ws_result = await db.execute(
            select(GroupWorkSession.id).where(
                GroupWorkSession.assignment_id == assignment_id,
                GroupWorkSession.group_id.in_(group_ids),
            )
        )
        my_session_id = ws_result.scalar_one_or_none()
    else:
        sub_result = await db.execute(
            select(IndividualSubmission.id).where(
                IndividualSubmission.assignment_id == assignment_id,
                IndividualSubmission.student_id == student.id,
            )
        )
        my_session_id = sub_result.scalar_one_or_none()

    if not my_session_id:
        return {"feedback": []}

    reviews_result = await db.execute(
        select(PeerReview)
        .where(
            PeerReview.round_id == review_round.id,
            PeerReview.reviewee_id == my_session_id,
            PeerReview.submitted_at.isnot(None),
        )
        .options(selectinload(PeerReview.reviewer_user))
    )
    reviews = reviews_result.scalars().all()

    # Return anonymous feedback (don't reveal reviewer identity)
    return {
        "feedback": [
            {
                "id": r.id,
                "comments": r.comments or {},
                "score": r.score,
                "reviewer_name": f"Nhóm đánh giá #{idx + 1}",  # Anonymous
                "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            }
            for idx, r in enumerate(reviews)
        ]
    }


@router.post("/assignments/{assignment_id}/auto-activate")
async def auto_activate_peer_review(
    assignment_id: int,
    api_key: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Auto-activate peer review when peer_review_start_time is reached.
    This is an internal endpoint called by the scheduler.
    """
    from app.core.config import get_settings
    settings = get_settings()

    # Verify internal API key
    if api_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")

    # Get assignment
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check if peer review should be activated
    if assignment.peer_review_status in ("active", "completed"):
        return {"message": "Peer review already activated or completed", "status": assignment.peer_review_status}

    if assignment.content_type != "worksheet":
        raise HTTPException(status_code=400, detail="Peer review only for worksheets")

    # Check if round already exists
    existing = await db.execute(
        select(PeerReviewRound).where(PeerReviewRound.assignment_id == assignment_id)
    )
    if existing.scalar_one_or_none():
        return {"message": "Peer review round already exists"}

    # Auto-activate peer review (similar logic to activate_peer_review)
    now = datetime.now(timezone.utc)
    pairings = []
    reviews_to_create = []

    if assignment.work_type == "group":
        # Get submitted group sessions
        ws_result = await db.execute(
            select(GroupWorkSession)
            .where(
                GroupWorkSession.assignment_id == assignment_id,
                GroupWorkSession.status == "submitted",
            )
            .order_by(GroupWorkSession.id)
        )
        sessions = ws_result.scalars().all()
        if len(sessions) < 2:
            logger.warning(f"Not enough submitted groups for peer review activation: {len(sessions)}")
            return {"message": "Not enough submitted sessions", "count": len(sessions)}

        # Circular pairing
        for i, session in enumerate(sessions):
            next_session = sessions[(i + 1) % len(sessions)]
            pairings.append({
                "reviewer_id": session.id,
                "reviewee_id": next_session.id,
                "reviewer_group_id": session.group_id,
                "reviewee_group_id": next_session.group_id,
            })
            reviews_to_create.append(PeerReview(
                reviewer_id=session.id,
                reviewee_id=next_session.id,
                reviewer_type="group",
            ))
    else:
        # Individual submissions
        sub_result = await db.execute(
            select(IndividualSubmission)
            .where(
                IndividualSubmission.assignment_id == assignment_id,
                IndividualSubmission.status == "submitted",
            )
        )
        submissions = sub_result.scalars().all()
        if len(submissions) < 2:
            logger.warning(f"Not enough submitted individuals for peer review activation: {len(submissions)}")
            return {"message": "Not enough submitted sessions", "count": len(submissions)}

        # Shuffle and circular pairing
        shuffled = list(submissions)
        random.shuffle(shuffled)
        for i, sub in enumerate(shuffled):
            next_sub = shuffled[(i + 1) % len(shuffled)]
            pairings.append({
                "reviewer_id": sub.id,
                "reviewee_id": next_sub.id,
                "reviewer_student_id": sub.student_id,
                "reviewee_student_id": next_sub.student_id,
            })
            reviews_to_create.append(PeerReview(
                reviewer_id=sub.id,
                reviewee_id=next_sub.id,
                reviewer_type="individual",
            ))

    # Create round
    review_round = PeerReviewRound(
        assignment_id=assignment_id,
        status="active",
        pairings=pairings,
        activated_at=now,
    )
    db.add(review_round)
    await db.flush()

    # Create review records
    for review in reviews_to_create:
        review.round_id = review_round.id
        db.add(review)

    # Update assignment status
    assignment.peer_review_status = "active"
    await db.commit()

    logger.info(f"Auto-activated peer review for assignment {assignment_id} with {len(pairings)} pairings")

    return {
        "message": "Peer review auto-activated successfully",
        "assignment_id": assignment_id,
        "pairings_count": len(pairings),
        "status": "active"
    }
