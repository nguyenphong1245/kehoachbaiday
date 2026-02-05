"""
API Routes cho Student Portal - Trang học sinh
"""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_db, get_current_user, require_role, user_has_role
from app.models.user import User
from app.models.classroom import Classroom
from app.models.class_student import ClassStudent
from app.models.class_assignment import ClassAssignment
from app.models.student_group import StudentGroup, GroupMember
from app.models.work_session import GroupWorkSession, IndividualSubmission, GroupDiscussion
from app.models.shared_worksheet import SharedWorksheet
from app.models.shared_quiz import SharedQuiz
from app.models.code_exercise import CodeExercise
from app.core.security import get_password_hash, verify_password
from app.services.piston_service import run_test_cases
from app.models.peer_review import PeerReviewRound, PeerReview
from app.api.routes.ws_collaboration import broadcast_submission
import random

router = APIRouter()
logger = logging.getLogger(__name__)


# ==================== Schemas ====================

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class StudentClassroomInfo(BaseModel):
    classroom_id: int
    classroom_name: str
    grade: Optional[str] = None
    school_year: Optional[str] = None
    student_id: int  # class_student.id
    student_code: Optional[str] = None


class StudentAssignmentInfo(BaseModel):
    id: int
    title: str
    content_type: str
    content_id: int
    work_type: str
    is_active: bool
    start_at: Optional[str] = None
    due_date: Optional[str] = None
    auto_peer_review: bool = False
    peer_review_status: Optional[str] = None
    lesson_info: Optional[Dict[str, Any]] = None
    classroom_id: int
    classroom_name: str
    status: str = "not_started"  # not_started, in_progress, submitted
    created_at: str


class StudentDashboardResponse(BaseModel):
    classrooms: List[StudentClassroomInfo]
    assignments: List[StudentAssignmentInfo]


class GroupMemberInfo(BaseModel):
    student_id: int
    full_name: str
    student_code: Optional[str] = None


class MyGroupInfo(BaseModel):
    group_id: int
    group_name: str
    members: List[GroupMemberInfo]
    my_student_id: int  # ID của học sinh hiện tại trong nhóm
    work_session_id: Optional[int] = None
    session_status: Optional[str] = None


class WorkSessionResponse(BaseModel):
    session_id: int
    assignment_id: int
    status: str
    answers: Dict[str, Any]
    task_assignments: Dict[str, Any]
    leader_id: Optional[int] = None
    leader_votes: Dict[str, Any]
    submitted_at: Optional[str] = None


class IndividualSessionResponse(BaseModel):
    session_id: int
    assignment_id: int
    status: str
    answers: Dict[str, Any]
    submitted_at: Optional[str] = None


class SubmitAnswersRequest(BaseModel):
    answers: Dict[str, Any]


class RunCodeRequest(BaseModel):
    code: str
    language: str = "python"
    stdin: str = ""


class AssignmentContentResponse(BaseModel):
    assignment: StudentAssignmentInfo
    content: Optional[Dict[str, Any]] = None
    my_group: Optional[MyGroupInfo] = None
    work_session: Optional[Dict[str, Any]] = None


# ==================== Helpers ====================

async def _get_student_enrollment(user: User, db: AsyncSession) -> list[ClassStudent]:
    """Get all ClassStudent records for this user"""
    result = await db.execute(
        select(ClassStudent)
        .where(ClassStudent.user_id == user.id)
        .options(selectinload(ClassStudent.classroom))
    )
    return list(result.scalars().all())


async def _get_student_record_for_assignment(
    user: User, assignment: ClassAssignment, db: AsyncSession
) -> ClassStudent:
    """Get the ClassStudent record for user in the assignment's classroom"""
    result = await db.execute(
        select(ClassStudent).where(
            ClassStudent.user_id == user.id,
            ClassStudent.classroom_id == assignment.classroom_id,
        )
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=403, detail="Bạn không thuộc lớp này")
    return student


async def _get_submission_status(
    assignment: ClassAssignment, student: ClassStudent, db: AsyncSession
) -> str:
    """Get the submission status for a student on an assignment"""
    if assignment.work_type == "group":
        # Find the student's group in this classroom
        group_result = await db.execute(
            select(GroupMember.group_id).where(
                GroupMember.student_id == student.id
            )
        )
        group_ids = [r for r in group_result.scalars().all()]
        if not group_ids:
            return "not_started"

        # Check if there's a work session for any of the student's groups
        ws_result = await db.execute(
            select(GroupWorkSession.status).where(
                GroupWorkSession.assignment_id == assignment.id,
                GroupWorkSession.group_id.in_(group_ids),
            )
        )
        ws_status = ws_result.scalar_one_or_none()
        if not ws_status:
            return "not_started"
        return ws_status
    else:
        sub_result = await db.execute(
            select(IndividualSubmission.status).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.student_id == student.id,
            )
        )
        sub_status = sub_result.scalar_one_or_none()
        if not sub_status:
            return "not_started"
        return sub_status


# ==================== Routes ====================

@router.get("/dashboard", response_model=StudentDashboardResponse)
async def student_dashboard(
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Dashboard học sinh - lấy lớp và bài được giao"""
    enrollments = await _get_student_enrollment(current_user, db)

    classrooms_info = []
    all_assignments = []

    for enrollment in enrollments:
        cr = enrollment.classroom
        classrooms_info.append(StudentClassroomInfo(
            classroom_id=cr.id,
            classroom_name=cr.name,
            grade=cr.grade,
            school_year=cr.school_year,
            student_id=enrollment.id,
            student_code=enrollment.student_code,
        ))

        # Get active assignments for this classroom
        result = await db.execute(
            select(ClassAssignment)
            .where(
                ClassAssignment.classroom_id == cr.id,
                ClassAssignment.is_active == True,
            )
            .order_by(ClassAssignment.created_at.desc())
        )
        assignments = result.scalars().all()

        for a in assignments:
            status = await _get_submission_status(a, enrollment, db)
            all_assignments.append(StudentAssignmentInfo(
                id=a.id,
                title=a.title,
                content_type=a.content_type,
                content_id=a.content_id,
                work_type=a.work_type,
                is_active=a.is_active,
                start_at=a.start_at.isoformat() if a.start_at else None,
                due_date=a.due_date.isoformat() if a.due_date else None,
                auto_peer_review=a.auto_peer_review,
                peer_review_status=a.peer_review_status,
                lesson_info=a.lesson_info,
                classroom_id=cr.id,
                classroom_name=cr.name,
                status=status,
                created_at=a.created_at.isoformat() if a.created_at else "",
            ))

    return StudentDashboardResponse(
        classrooms=classrooms_info,
        assignments=all_assignments,
    )


@router.get("/assignments/{assignment_id}", response_model=AssignmentContentResponse)
async def get_assignment_detail(
    assignment_id: int,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Chi tiết bài giao + nội dung cho học sinh"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    student = await _get_student_record_for_assignment(current_user, assignment, db)

    # Check start_at - chặn nếu chưa đến giờ
    if assignment.start_at and datetime.now(timezone.utc) < assignment.start_at:
        raise HTTPException(status_code=403, detail="Chưa đến giờ làm bài")

    # Get classroom name
    cr_result = await db.execute(
        select(Classroom.name).where(Classroom.id == assignment.classroom_id)
    )
    classroom_name = cr_result.scalar() or ""

    # Get submission status
    status = await _get_submission_status(assignment, student, db)

    assignment_info = StudentAssignmentInfo(
        id=assignment.id,
        title=assignment.title,
        content_type=assignment.content_type,
        content_id=assignment.content_id,
        work_type=assignment.work_type,
        is_active=assignment.is_active,
        start_at=assignment.start_at.isoformat() if assignment.start_at else None,
        due_date=assignment.due_date.isoformat() if assignment.due_date else None,
        auto_peer_review=assignment.auto_peer_review,
        peer_review_status=assignment.peer_review_status,
        lesson_info=assignment.lesson_info,
        classroom_id=assignment.classroom_id,
        classroom_name=classroom_name,
        status=status,
        created_at=assignment.created_at.isoformat() if assignment.created_at else "",
    )

    # Load content
    content = None
    if assignment.content_type == "worksheet":
        ws_result = await db.execute(
            select(SharedWorksheet).where(SharedWorksheet.id == assignment.content_id)
        )
        ws = ws_result.scalar_one_or_none()
        if ws:
            content = {
                "id": ws.id,
                "title": ws.title,
                "content": ws.content,
                "questions": ws.questions,
                "lesson_info": ws.lesson_info,
            }
    elif assignment.content_type == "quiz":
        q_result = await db.execute(
            select(SharedQuiz).where(SharedQuiz.id == assignment.content_id)
        )
        q = q_result.scalar_one_or_none()
        if q:
            content = {
                "id": q.id,
                "title": q.title,
                "questions": q.questions if hasattr(q, 'questions') else None,
            }
    elif assignment.content_type == "code_exercise":
        ce_result = await db.execute(
            select(CodeExercise).where(CodeExercise.id == assignment.content_id)
        )
        ce = ce_result.scalar_one_or_none()
        if ce:
            content = {
                "id": ce.id,
                "title": ce.title,
                "description": ce.description if hasattr(ce, 'description') else None,
            }

    # Get group info if group work
    my_group = None
    if assignment.work_type == "group":
        my_group = await _get_my_group_for_assignment(student, assignment, db)

    # Get existing work session
    work_session = None
    if assignment.work_type == "group" and my_group and my_group.work_session_id:
        ws_result = await db.execute(
            select(GroupWorkSession).where(GroupWorkSession.id == my_group.work_session_id)
        )
        ws = ws_result.scalar_one_or_none()
        if ws:
            work_session = {
                "session_id": ws.id,
                "status": ws.status,
                "answers": ws.answers or {},
                "task_assignments": ws.task_assignments or {},
                "leader_id": ws.leader_id,
                "leader_votes": ws.leader_votes or {},
                "submitted_at": ws.submitted_at.isoformat() if ws.submitted_at else None,
            }
    elif assignment.work_type == "individual":
        sub_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.student_id == student.id,
            )
        )
        sub = sub_result.scalar_one_or_none()
        if sub:
            work_session = {
                "session_id": sub.id,
                "status": sub.status,
                "answers": sub.answers or {},
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
            }

    return AssignmentContentResponse(
        assignment=assignment_info,
        content=content,
        my_group=my_group,
        work_session=work_session,
    )


async def _get_my_group_for_assignment(
    student: ClassStudent, assignment: ClassAssignment, db: AsyncSession
) -> Optional[MyGroupInfo]:
    """Get the student's group for this assignment's classroom"""
    # Find group through group_members
    result = await db.execute(
        select(GroupMember)
        .where(GroupMember.student_id == student.id)
        .options(
            selectinload(GroupMember.group).selectinload(StudentGroup.members).selectinload(GroupMember.student)
        )
    )
    memberships = result.scalars().all()

    # Find the group that belongs to this classroom
    for membership in memberships:
        group = membership.group
        if group.classroom_id == assignment.classroom_id:
            members_info = [
                GroupMemberInfo(
                    student_id=m.student_id,
                    full_name=m.student.full_name if m.student else "",
                    student_code=m.student.student_code if m.student else None,
                )
                for m in group.members
            ]

            # Check for existing work session
            ws_result = await db.execute(
                select(GroupWorkSession).where(
                    GroupWorkSession.assignment_id == assignment.id,
                    GroupWorkSession.group_id == group.id,
                )
            )
            ws = ws_result.scalar_one_or_none()

            return MyGroupInfo(
                group_id=group.id,
                group_name=group.name,
                members=members_info,
                my_student_id=student.id,
                work_session_id=ws.id if ws else None,
                session_status=ws.status if ws else None,
            )

    return None


@router.get("/assignments/{assignment_id}/my-group", response_model=Optional[MyGroupInfo])
async def get_my_group(
    assignment_id: int,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Thông tin nhóm của HS cho bài này"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    student = await _get_student_record_for_assignment(current_user, assignment, db)
    return await _get_my_group_for_assignment(student, assignment, db)


@router.post("/assignments/{assignment_id}/start-session")
async def start_work_session(
    assignment_id: int,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Tạo hoặc lấy phiên làm bài"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment or not assignment.is_active:
        raise HTTPException(status_code=404, detail="Bài giao không tồn tại hoặc đã bị tắt")

    # Check start_at
    if assignment.start_at and datetime.now(timezone.utc) < assignment.start_at:
        raise HTTPException(status_code=403, detail="Chưa đến giờ làm bài")

    student = await _get_student_record_for_assignment(current_user, assignment, db)

    if assignment.work_type == "group":
        # Find student's group
        group_info = await _get_my_group_for_assignment(student, assignment, db)
        if not group_info:
            raise HTTPException(status_code=400, detail="Bạn chưa được phân vào nhóm nào")

        # Get or create group work session
        ws_result = await db.execute(
            select(GroupWorkSession).where(
                GroupWorkSession.assignment_id == assignment.id,
                GroupWorkSession.group_id == group_info.group_id,
            )
        )
        session = ws_result.scalar_one_or_none()

        if not session:
            session = GroupWorkSession(
                assignment_id=assignment.id,
                group_id=group_info.group_id,
                status="in_progress",
                answers={},
                task_assignments={},
                leader_votes={},
            )
            db.add(session)
            await db.commit()
            await db.refresh(session)

        return {
            "session_id": session.id,
            "session_type": "group",
            "status": session.status,
            "answers": session.answers or {},
            "task_assignments": session.task_assignments or {},
            "leader_id": session.leader_id,
            "leader_votes": session.leader_votes or {},
            "group_id": group_info.group_id,
        }
    else:
        # Individual submission
        sub_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.student_id == student.id,
            )
        )
        submission = sub_result.scalar_one_or_none()

        if not submission:
            submission = IndividualSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
                answers={},
                status="in_progress",
            )
            db.add(submission)
            await db.commit()
            await db.refresh(submission)

        return {
            "session_id": submission.id,
            "session_type": "individual",
            "status": submission.status,
            "answers": submission.answers or {},
        }


@router.post("/assignments/{assignment_id}/run-code")
async def run_code_in_assignment(
    assignment_id: int,
    data: RunCodeRequest,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Chạy code với test cases của bài tập"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment or not assignment.is_active:
        raise HTTPException(status_code=404, detail="Bài giao không tồn tại hoặc đã bị tắt")

    # Verify student has access
    await _get_student_record_for_assignment(current_user, assignment, db)

    # Check if it's a code exercise
    if assignment.content_type != "code_exercise":
        raise HTTPException(status_code=400, detail="Bài giao này không phải bài lập trình")

    # Get code exercise with test cases
    ce_result = await db.execute(
        select(CodeExercise).where(CodeExercise.id == assignment.content_id)
    )
    ce = ce_result.scalar_one_or_none()
    if not ce:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài tập code")

    test_cases = ce.test_cases or []
    if not test_cases:
        raise HTTPException(status_code=400, detail="Bài tập chưa có test cases")

    # Run code against test cases
    result = await run_test_cases(
        code=data.code,
        test_cases=test_cases,
        language=data.language or ce.language,
        timeout_seconds=ce.time_limit_seconds or 5,
    )

    return result


@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    data: SubmitAnswersRequest,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Nộp bài"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    student = await _get_student_record_for_assignment(current_user, assignment, db)
    now = datetime.now(timezone.utc)

    if assignment.work_type == "group":
        group_info = await _get_my_group_for_assignment(student, assignment, db)
        if not group_info or not group_info.work_session_id:
            raise HTTPException(status_code=400, detail="Chưa có phiên làm bài")

        ws_result = await db.execute(
            select(GroupWorkSession).where(GroupWorkSession.id == group_info.work_session_id)
        )
        session = ws_result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Phiên làm bài không tồn tại")
        if session.status == "submitted":
            raise HTTPException(status_code=400, detail="Bài đã được nộp rồi")

        # MANDATORY: Must elect leader before submission
        if not session.leader_id:
            raise HTTPException(
                status_code=400,
                detail="Nhóm phải bầu nhóm trưởng trước khi nộp bài"
            )

        # Only leader can submit
        if session.leader_id != student.id:
            raise HTTPException(status_code=403, detail="Chỉ nhóm trưởng mới được nộp bài")

        final_answers = dict(data.answers)

        # For code exercises, auto-run tests and store results
        if assignment.content_type == "code_exercise" and final_answers.get("code"):
            test_result = await _run_code_tests_for_submit(assignment, final_answers["code"], db)
            if test_result:
                final_answers["test_result"] = test_result

        session.answers = final_answers
        session.status = "submitted"
        session.submitted_at = now
        await db.commit()

        # Broadcast submission to all group members via WebSocket
        try:
            submitter_name = student.full_name or f"Học sinh #{student.id}"
            await broadcast_submission(session.id, current_user.id, submitter_name)
        except Exception as e:
            logger.warning(f"Failed to broadcast submission: {e}")

        # Auto peer review: always try to activate when all groups submitted (for group work)
        peer_review_activated = False
        if not assignment.peer_review_status:
            peer_review_activated = await _maybe_auto_activate_peer_review(assignment, db)

        return {
            "message": "Nộp bài nhóm thành công",
            "status": "submitted",
            "peer_review_activated": peer_review_activated,
            "peer_review_status": assignment.peer_review_status,
        }
    else:
        sub_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.student_id == student.id,
            )
        )
        submission = sub_result.scalar_one_or_none()
        if not submission:
            submission = IndividualSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
            )
            db.add(submission)

        if submission.status == "submitted":
            raise HTTPException(status_code=400, detail="Bài đã được nộp rồi")

        final_answers = dict(data.answers)

        # For code exercises, auto-run tests and store results
        if assignment.content_type == "code_exercise" and final_answers.get("code"):
            test_result = await _run_code_tests_for_submit(assignment, final_answers["code"], db)
            if test_result:
                final_answers["test_result"] = test_result

        submission.answers = final_answers
        submission.status = "submitted"
        submission.submitted_at = now
        await db.commit()

        # Auto peer review: check if all submitted
        peer_review_activated = False
        if assignment.auto_peer_review and not assignment.peer_review_status:
            peer_review_activated = await _maybe_auto_activate_peer_review(assignment, db)

        return {
            "message": "Nộp bài thành công",
            "status": "submitted",
            "peer_review_activated": peer_review_activated,
            "peer_review_status": assignment.peer_review_status,
        }


async def _run_code_tests_for_submit(assignment: ClassAssignment, code: str, db: AsyncSession) -> dict | None:
    """Chạy test cases khi nộp bài code để lưu kết quả vào answers"""
    try:
        ce_result = await db.execute(
            select(CodeExercise).where(CodeExercise.id == assignment.content_id)
        )
        ce = ce_result.scalar_one_or_none()
        if not ce or not ce.test_cases:
            return None

        result = await run_test_cases(
            code=code,
            test_cases=ce.test_cases,
            language=ce.language,
            timeout_seconds=ce.time_limit_seconds or 5,
        )
        return {
            "status": result.get("status", "error"),
            "passed_tests": result.get("passed_tests", 0),
            "total_tests": result.get("total_tests", 0),
            "execution_time_ms": result.get("execution_time_ms", 0),
        }
    except Exception:
        return None


async def _maybe_auto_activate_peer_review(assignment: ClassAssignment, db: AsyncSession) -> bool:
    """Tự động kích hoạt peer review khi tất cả đã nộp (chỉ cho worksheet)"""
    # Peer review only for worksheet
    if assignment.content_type != "worksheet":
        return False

    total_result = await db.execute(
        select(func.count(ClassStudent.id)).where(ClassStudent.classroom_id == assignment.classroom_id)
    )
    total_students = total_result.scalar() or 0

    if assignment.work_type == "group":
        submitted_result = await db.execute(
            select(func.count(GroupWorkSession.id)).where(
                GroupWorkSession.assignment_id == assignment.id,
                GroupWorkSession.status == "submitted",
            )
        )
        # Count groups instead of students
        total_groups_result = await db.execute(
            select(func.count(StudentGroup.id)).where(StudentGroup.classroom_id == assignment.classroom_id)
        )
        total_students = total_groups_result.scalar() or 0
    else:
        submitted_result = await db.execute(
            select(func.count(IndividualSubmission.id)).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.status == "submitted",
            )
        )

    submitted_count = submitted_result.scalar() or 0

    if submitted_count < 2 or submitted_count < total_students:
        return False

    # Check no existing round
    existing = await db.execute(
        select(PeerReviewRound).where(PeerReviewRound.assignment_id == assignment.id)
    )
    if existing.scalar_one_or_none():
        return False

    # Create pairings
    now = datetime.now(timezone.utc)
    pairings = []
    reviews_to_create = []

    if assignment.work_type == "group":
        ws_result = await db.execute(
            select(GroupWorkSession).where(
                GroupWorkSession.assignment_id == assignment.id,
                GroupWorkSession.status == "submitted",
            ).order_by(GroupWorkSession.id)
        )
        sessions = ws_result.scalars().all()
        shuffled = list(sessions)
        random.shuffle(shuffled)
        for i, s in enumerate(shuffled):
            next_s = shuffled[(i + 1) % len(shuffled)]
            pairings.append({"reviewer_id": s.id, "reviewee_id": next_s.id})
            reviews_to_create.append(PeerReview(reviewer_id=s.id, reviewee_id=next_s.id, reviewer_type="group"))
    else:
        sub_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.status == "submitted",
            )
        )
        submissions = sub_result.scalars().all()
        shuffled = list(submissions)
        random.shuffle(shuffled)
        for i, sub in enumerate(shuffled):
            next_sub = shuffled[(i + 1) % len(shuffled)]
            pairings.append({"reviewer_id": sub.id, "reviewee_id": next_sub.id})
            reviews_to_create.append(PeerReview(reviewer_id=sub.id, reviewee_id=next_sub.id, reviewer_type="individual"))

    review_round = PeerReviewRound(
        assignment_id=assignment.id,
        status="active",
        pairings=pairings,
        activated_at=now,
    )
    db.add(review_round)
    await db.flush()

    for review in reviews_to_create:
        review.round_id = review_round.id
        db.add(review)

    assignment.peer_review_status = "active"
    await db.commit()
    logger.info(f"Auto-activated peer review for assignment {assignment.id}")
    return True


class MemberEvaluation(BaseModel):
    student_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class MemberEvaluationRequest(BaseModel):
    evaluations: List[MemberEvaluation]


@router.post("/assignments/{assignment_id}/evaluate-members")
async def evaluate_group_members(
    assignment_id: int,
    data: MemberEvaluationRequest,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Đánh giá thành viên nhóm sau khi nộp bài"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment or assignment.work_type != "group":
        raise HTTPException(status_code=400, detail="Bài giao không phải bài nhóm")

    student = await _get_student_record_for_assignment(current_user, assignment, db)
    group_info = await _get_my_group_for_assignment(student, assignment, db)
    if not group_info or not group_info.work_session_id:
        raise HTTPException(status_code=400, detail="Chưa có phiên làm bài")

    ws_result = await db.execute(
        select(GroupWorkSession).where(GroupWorkSession.id == group_info.work_session_id)
    )
    session = ws_result.scalar_one_or_none()
    if not session or session.status != "submitted":
        raise HTTPException(status_code=400, detail="Nhóm chưa nộp bài")

    # Save evaluations - use flag_modified to ensure JSON changes are detected
    evals = dict(session.member_evaluations) if session.member_evaluations else {}
    evals[str(student.id)] = [
        {"student_id": e.student_id, "rating": e.rating, "comment": e.comment}
        for e in data.evaluations
    ]
    session.member_evaluations = evals
    flag_modified(session, "member_evaluations")

    logger.info(f"Saved member evaluations for student {student.id} on session {session.id}: {evals}")
    await db.commit()
    await db.refresh(session)
    logger.info(f"After commit - member_evaluations: {session.member_evaluations}")

    return {"message": "Đã gửi đánh giá thành viên"}


@router.get("/assignments/{assignment_id}/member-evaluation-status")
async def get_member_evaluation_status(
    assignment_id: int,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """
    Lấy trạng thái đánh giá thành viên nhóm.
    Trả về: danh sách thành viên, ai đã đánh giá, và hiện tại user đã đánh giá chưa.
    """
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment or assignment.work_type != "group":
        raise HTTPException(status_code=400, detail="Bài giao không phải bài nhóm")

    student = await _get_student_record_for_assignment(current_user, assignment, db)
    group_info = await _get_my_group_for_assignment(student, assignment, db)
    if not group_info or not group_info.work_session_id:
        return {
            "submitted": False,
            "group_submitted": False,
            "my_student_id": student.id,
            "members": [],
            "evaluations": {},
            "my_evaluation_submitted": False,
        }

    ws_result = await db.execute(
        select(GroupWorkSession).where(GroupWorkSession.id == group_info.work_session_id)
    )
    session = ws_result.scalar_one_or_none()
    if not session:
        return {
            "submitted": False,
            "group_submitted": False,
            "my_student_id": student.id,
            "members": [],
            "evaluations": {},
            "my_evaluation_submitted": False,
        }

    # Get evaluations
    evaluations = session.member_evaluations or {}
    my_evaluation_submitted = str(student.id) in evaluations

    # Get members list
    members = [
        {
            "student_id": m.student_id,
            "full_name": m.full_name,
            "student_code": m.student_code,
        }
        for m in group_info.members
    ]

    # List of who has submitted evaluations
    evaluators = list(evaluations.keys())

    return {
        "submitted": session.status == "submitted",
        "group_submitted": session.status == "submitted",
        "my_student_id": student.id,
        "members": members,
        "evaluations": evaluations,
        "evaluators": evaluators,
        "my_evaluation_submitted": my_evaluation_submitted,
    }


@router.get("/assignments/{assignment_id}/work-session")
async def get_work_session(
    assignment_id: int,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Lấy state phiên làm bài hiện tại (cho refresh)"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    student = await _get_student_record_for_assignment(current_user, assignment, db)

    if assignment.work_type == "group":
        group_info = await _get_my_group_for_assignment(student, assignment, db)
        if not group_info or not group_info.work_session_id:
            return {"session": None}

        ws_result = await db.execute(
            select(GroupWorkSession).where(GroupWorkSession.id == group_info.work_session_id)
        )
        session = ws_result.scalar_one_or_none()
        if not session:
            return {"session": None}

        return {
            "session": {
                "session_id": session.id,
                "session_type": "group",
                "status": session.status,
                "answers": session.answers or {},
                "task_assignments": session.task_assignments or {},
                "leader_id": session.leader_id,
                "leader_votes": session.leader_votes or {},
                "submitted_at": session.submitted_at.isoformat() if session.submitted_at else None,
            }
        }
    else:
        sub_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.student_id == student.id,
            )
        )
        submission = sub_result.scalar_one_or_none()
        if not submission:
            return {"session": None}

        return {
            "session": {
                "session_id": submission.id,
                "session_type": "individual",
                "status": submission.status,
                "answers": submission.answers or {},
                "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
            }
        }


@router.get("/assignments/{assignment_id}/discussion")
async def get_discussion(
    assignment_id: int,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Lấy tin nhắn chat cũ của nhóm"""
    try:
        result = await db.execute(
            select(ClassAssignment).where(ClassAssignment.id == assignment_id)
        )
        assignment = result.scalar_one_or_none()
        if not assignment:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")
        if assignment.work_type != "group":
            return {"messages": []}

        student = await _get_student_record_for_assignment(current_user, assignment, db)
        group_info = await _get_my_group_for_assignment(student, assignment, db)

        if not group_info or not group_info.work_session_id:
            logger.info(f"No group_info or work_session_id for assignment {assignment_id}, user {current_user.id}")
            return {"messages": []}

        logger.info(f"Loading discussion for work_session_id={group_info.work_session_id}")

        msg_result = await db.execute(
            select(GroupDiscussion)
            .where(GroupDiscussion.work_session_id == group_info.work_session_id)
            .options(selectinload(GroupDiscussion.user))
            .order_by(GroupDiscussion.created_at.asc())
        )
        messages = msg_result.scalars().all()

        logger.info(f"Found {len(messages)} messages for work_session_id={group_info.work_session_id}")

        return {
            "messages": [
                {
                    "id": m.id,
                    "user_id": m.user_id,
                    "user_name": m.user.full_name if m.user else "",
                    "message": m.message,
                    "created_at": m.created_at.isoformat() if m.created_at else "",
                }
                for m in messages
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_discussion: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(require_role("student")),
    db: AsyncSession = Depends(get_db),
):
    """Đổi mật khẩu mặc định"""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")

    current_user.hashed_password = get_password_hash(data.new_password)
    await db.commit()

    return {"message": "Đổi mật khẩu thành công"}


@router.post("/assignments/{assignment_id}/auto-submit")
async def auto_submit_assignment(
    assignment_id: int,
    api_key: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Auto-submit all in-progress sessions when due_date expires.
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

    now = datetime.now(timezone.utc)
    count = 0

    # Auto-submit based on work type
    if assignment.work_type == "group":
        # Update all in_progress GroupWorkSession to submitted
        sessions_result = await db.execute(
            select(GroupWorkSession).where(
                GroupWorkSession.assignment_id == assignment_id,
                GroupWorkSession.status == "in_progress"
            )
        )
        sessions = sessions_result.scalars().all()

        for session in sessions:
            session.status = "submitted"
            session.submitted_at = now
            count += 1

        await db.commit()
        logger.info(f"Auto-submitted {count} group sessions for assignment {assignment_id}")

    else:
        # Update all in_progress IndividualSubmission to submitted
        submissions_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.assignment_id == assignment_id,
                IndividualSubmission.status == "in_progress"
            )
        )
        submissions = submissions_result.scalars().all()

        for submission in submissions:
            submission.status = "submitted"
            submission.submitted_at = now
            count += 1

        await db.commit()
        logger.info(f"Auto-submitted {count} individual submissions for assignment {assignment_id}")

    return {"message": "Auto-submit completed", "count": count, "assignment_id": assignment_id}
