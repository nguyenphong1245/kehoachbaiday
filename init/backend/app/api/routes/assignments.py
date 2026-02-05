"""
API Routes cho Giao bài cho lớp
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_db, get_current_user, require_role, require_teacher, user_has_role
from app.core.logging import logger
from app.models.user import User
from app.models.classroom import Classroom
from app.models.class_student import ClassStudent
from app.models.class_assignment import ClassAssignment
from app.models.classroom_material import ClassroomMaterial
from app.models.shared_worksheet import SharedWorksheet
from app.models.shared_quiz import SharedQuiz
from app.models.code_exercise import CodeExercise
from app.models.work_session import GroupWorkSession, IndividualSubmission
from app.models.student_group import StudentGroup, GroupMember
from pydantic import BaseModel, Field
from app.schemas.class_assignment import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentRead,
    AssignmentListResponse,
)


async def _check_column_exists(db: AsyncSession, table: str, column: str) -> bool:
    """Check if a column exists in a table"""
    try:
        result = await db.execute(text(f"""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = '{table}' AND column_name = '{column}'
        """))
        return result.scalar() is not None
    except Exception:
        return False


class GradeSubmissionRequest(BaseModel):
    submission_type: str = Field(..., description="'individual', 'group', or 'group_member'")
    submission_id: int
    student_id: Optional[int] = Field(None, description="Required for group_member type")
    score: float = Field(..., ge=0, le=10)
    comment: Optional[str] = None

router = APIRouter()


async def _resolve_content_title(db: AsyncSession, content_type: str, content_id: int) -> str:
    """Get the title from the content based on type"""
    if content_type == "worksheet":
        result = await db.execute(select(SharedWorksheet.title).where(SharedWorksheet.id == content_id))
    elif content_type == "quiz":
        result = await db.execute(select(SharedQuiz.title).where(SharedQuiz.id == content_id))
    elif content_type == "code_exercise":
        result = await db.execute(select(CodeExercise.title).where(CodeExercise.id == content_id))
    else:
        return ""
    title = result.scalar_one_or_none()
    return title or ""


async def _verify_teacher_owns_classroom(classroom_id: int, user: User, db: AsyncSession) -> Classroom:
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
    if classroom.teacher_id != user.id and not user_has_role(user, "admin"):
        raise HTTPException(status_code=403, detail="Không có quyền")
    return classroom


async def _build_assignment_read(
    assignment: ClassAssignment,
    db: AsyncSession,
    classroom_name: str = "",
    lesson_info_fallback: dict | None = None,
) -> AssignmentRead:
    content_title = await _resolve_content_title(db, assignment.content_type, assignment.content_id)

    # Count submissions
    if assignment.work_type == "group":
        sub_count = await db.execute(
            select(func.count(GroupWorkSession.id)).where(
                GroupWorkSession.assignment_id == assignment.id,
                GroupWorkSession.status == "submitted",
            )
        )
    else:
        sub_count = await db.execute(
            select(func.count(IndividualSubmission.id)).where(
                IndividualSubmission.assignment_id == assignment.id,
                IndividualSubmission.status == "submitted",
            )
        )
    submission_count = sub_count.scalar() or 0

    # Count total students
    total_result = await db.execute(
        select(func.count(ClassStudent.id)).where(ClassStudent.classroom_id == assignment.classroom_id)
    )
    total_students = total_result.scalar() or 0

    # Safely get optional fields (may not exist if migrations not run)
    start_at = getattr(assignment, 'start_at', None)
    auto_peer_review = getattr(assignment, 'auto_peer_review', False)
    peer_review_status = getattr(assignment, 'peer_review_status', None)
    peer_review_start = getattr(assignment, 'peer_review_start_time', None)
    peer_review_end = getattr(assignment, 'peer_review_end_time', None)

    return AssignmentRead(
        id=assignment.id,
        classroom_id=assignment.classroom_id,
        classroom_name=classroom_name,
        content_type=assignment.content_type,
        content_id=assignment.content_id,
        content_title=content_title,
        title=assignment.title,
        description=assignment.description,
        work_type=assignment.work_type,
        is_active=assignment.is_active,
        start_at=start_at,
        due_date=assignment.due_date,
        auto_peer_review=auto_peer_review,
        lesson_info=assignment.lesson_info or lesson_info_fallback,
        peer_review_status=peer_review_status,
        peer_review_start_time=peer_review_start,
        peer_review_end_time=peer_review_end,
        submission_count=submission_count,
        total_students=total_students,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
    )


@router.post("/", response_model=AssignmentRead, status_code=201)
async def create_assignment(
    data: AssignmentCreate,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Giao bài cho lớp"""
    logger.info(f"Creating assignment: classroom_id={data.classroom_id}, content_type={data.content_type}, title={data.title}")

    classroom = await _verify_teacher_owns_classroom(data.classroom_id, current_user, db)

    # Validate content_type
    if data.content_type not in ("worksheet", "quiz", "code_exercise"):
        raise HTTPException(status_code=400, detail="content_type phải là 'worksheet', 'quiz', hoặc 'code_exercise'")

    # Validate content exists
    content_title = await _resolve_content_title(db, data.content_type, data.content_id)
    if not content_title:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy {data.content_type} với id {data.content_id}")

    # Parse dates safely
    def parse_date(date_str: str | None) -> datetime | None:
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except ValueError:
            return None

    due_date = parse_date(data.due_date)
    start_at = parse_date(data.start_at)
    peer_review_start_time = parse_date(data.peer_review_start_time)
    peer_review_end_time = parse_date(data.peer_review_end_time)

    # Check which columns exist in database
    has_start_at = await _check_column_exists(db, 'class_assignments', 'start_at')
    has_auto_peer_review = await _check_column_exists(db, 'class_assignments', 'auto_peer_review')
    has_peer_review_start = await _check_column_exists(db, 'class_assignments', 'peer_review_start_time')
    has_peer_review_end = await _check_column_exists(db, 'class_assignments', 'peer_review_end_time')

    logger.info(f"DB columns: start_at={has_start_at}, auto_peer_review={has_auto_peer_review}, peer_review_start={has_peer_review_start}, peer_review_end={has_peer_review_end}")

    # Use raw SQL for reliable insert
    import json
    lesson_info_json = json.dumps(data.lesson_info) if data.lesson_info else None

    # Build dynamic INSERT
    columns = ['classroom_id', 'content_type', 'content_id', 'title', 'description', 'work_type', 'due_date']
    values = [data.classroom_id, data.content_type, data.content_id, data.title, data.description or '', data.work_type, due_date]

    if data.lesson_plan_id:
        columns.append('lesson_plan_id')
        values.append(data.lesson_plan_id)

    if lesson_info_json:
        columns.append('lesson_info')
        values.append(lesson_info_json)

    if has_start_at:
        columns.append('start_at')
        values.append(start_at)

    if has_auto_peer_review:
        columns.append('auto_peer_review')
        values.append(data.auto_peer_review)

    if has_peer_review_start:
        columns.append('peer_review_start_time')
        values.append(peer_review_start_time)

    if has_peer_review_end:
        columns.append('peer_review_end_time')
        values.append(peer_review_end_time)

    # Build SQL
    placeholders = ', '.join([f':p{i}' for i in range(len(values))])
    col_names = ', '.join(columns)
    sql = f"INSERT INTO class_assignments ({col_names}) VALUES ({placeholders}) RETURNING id"

    params = {f'p{i}': v for i, v in enumerate(values)}

    try:
        result = await db.execute(text(sql), params)
        assignment_id = result.scalar()
        await db.commit()
        logger.info(f"Assignment created via raw SQL: id={assignment_id}")
    except Exception as e:
        await db.rollback()
        error_msg = str(e)
        logger.error(f"Database error creating assignment: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo bài giao: {error_msg}")

    # Schedule background jobs (non-blocking)
    try:
        from app.services.assignment_scheduler import schedule_auto_submit, schedule_peer_review_activation

        if due_date:
            await schedule_auto_submit(assignment_id, due_date)
            logger.info(f"Scheduled auto-submit for assignment {assignment_id}")

        if peer_review_start_time and has_peer_review_start:
            await schedule_peer_review_activation(assignment_id, peer_review_start_time)
            logger.info(f"Scheduled peer review activation for assignment {assignment_id}")
    except Exception as e:
        logger.warning(f"Failed to schedule jobs for assignment {assignment_id}: {e}")

    # Fetch and return assignment
    # Use raw SQL to avoid SQLAlchemy model mismatch with DB columns
    fetch_sql = """
        SELECT id, classroom_id, content_type, content_id, title, description,
               work_type, is_active, due_date, lesson_info, lesson_plan_id,
               peer_review_status, created_at, updated_at
        FROM class_assignments WHERE id = :id
    """
    fetch_result = await db.execute(text(fetch_sql), {"id": assignment_id})
    row = fetch_result.fetchone()

    if not row:
        raise HTTPException(status_code=500, detail="Assignment created but failed to fetch")

    # Count submissions
    total_result = await db.execute(
        select(func.count(ClassStudent.id)).where(ClassStudent.classroom_id == row.classroom_id)
    )
    total_students = total_result.scalar() or 0

    content_title = await _resolve_content_title(db, row.content_type, row.content_id)

    return AssignmentRead(
        id=row.id,
        classroom_id=row.classroom_id,
        classroom_name=classroom.name,
        content_type=row.content_type,
        content_id=row.content_id,
        content_title=content_title,
        title=row.title,
        description=row.description,
        work_type=row.work_type,
        is_active=row.is_active,
        start_at=start_at,  # Use parsed value since column might not exist
        due_date=row.due_date,
        auto_peer_review=data.auto_peer_review if has_auto_peer_review else False,
        lesson_info=data.lesson_info,
        peer_review_status=row.peer_review_status,
        peer_review_start_time=peer_review_start_time if has_peer_review_start else None,
        peer_review_end_time=peer_review_end_time if has_peer_review_end else None,
        submission_count=0,
        total_students=total_students,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("/classroom/{classroom_id}", response_model=AssignmentListResponse)
async def list_assignments(
    classroom_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Danh sách bài giao của lớp"""
    classroom = await _verify_teacher_owns_classroom(classroom_id, current_user, db)

    try:
        result = await db.execute(
            select(ClassAssignment)
            .where(ClassAssignment.classroom_id == classroom_id)
            .order_by(ClassAssignment.created_at.desc())
        )
        assignments = result.scalars().all()
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error fetching assignments: {error_msg}")
        if "column" in error_msg.lower() or "does not exist" in error_msg.lower():
            raise HTTPException(
                status_code=500,
                detail="Database cần được cập nhật. Chạy: cd init/backend && alembic upgrade head"
            )
        raise HTTPException(status_code=500, detail=f"Lỗi database: {error_msg}")

    # Pre-fetch classroom materials for lesson_info fallback
    mat_result = await db.execute(
        select(ClassroomMaterial).where(ClassroomMaterial.classroom_id == classroom_id)
    )
    material_lesson_map: dict[str, dict] = {}
    for m in mat_result.scalars().all():
        if m.lesson_info:
            material_lesson_map[f"{m.content_type}-{m.content_id}"] = m.lesson_info

    items = []
    for a in assignments:
        fallback = material_lesson_map.get(f"{a.content_type}-{a.content_id}")
        items.append(await _build_assignment_read(a, db, classroom.name, fallback))

    return AssignmentListResponse(assignments=items, total=len(items))


@router.get("/{assignment_id}", response_model=AssignmentRead)
async def get_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Chi tiết bài giao"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    # Get classroom name
    cr = await db.execute(select(Classroom.name).where(Classroom.id == assignment.classroom_id))
    classroom_name = cr.scalar() or ""

    return await _build_assignment_read(assignment, db, classroom_name)


@router.patch("/{assignment_id}", response_model=AssignmentRead)
async def update_assignment(
    assignment_id: int,
    data: AssignmentUpdate,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật bài giao"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    # Verify ownership
    await _verify_teacher_owns_classroom(assignment.classroom_id, current_user, db)

    if data.title is not None:
        assignment.title = data.title
    if data.description is not None:
        assignment.description = data.description
    if data.work_type is not None:
        assignment.work_type = data.work_type
    if data.is_active is not None:
        assignment.is_active = data.is_active
    if data.due_date is not None:
        try:
            assignment.due_date = datetime.fromisoformat(data.due_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="due_date không đúng format ISO")
    if data.start_at is not None:
        try:
            assignment.start_at = datetime.fromisoformat(data.start_at)
        except ValueError:
            raise HTTPException(status_code=400, detail="start_at không đúng format ISO")
    if data.auto_peer_review is not None:
        assignment.auto_peer_review = data.auto_peer_review

    await db.commit()
    await db.refresh(assignment)

    cr = await db.execute(select(Classroom.name).where(Classroom.id == assignment.classroom_id))
    classroom_name = cr.scalar() or ""
    return await _build_assignment_read(assignment, db, classroom_name)


@router.delete("/{assignment_id}", status_code=204)
async def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Xóa bài giao"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    await _verify_teacher_owns_classroom(assignment.classroom_id, current_user, db)

    await db.delete(assignment)
    await db.commit()


@router.put("/{assignment_id}/grade")
async def grade_submission(
    assignment_id: int,
    data: GradeSubmissionRequest,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Giáo viên chấm điểm bài nộp (worksheet / code exercise)"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    await _verify_teacher_owns_classroom(assignment.classroom_id, current_user, db)

    if data.submission_type == "individual":
        sub_result = await db.execute(
            select(IndividualSubmission).where(
                IndividualSubmission.id == data.submission_id,
                IndividualSubmission.assignment_id == assignment_id,
            )
        )
        submission = sub_result.scalar_one_or_none()
        if not submission:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài nộp")
        submission.teacher_score = data.score
        submission.teacher_comment = data.comment
    elif data.submission_type == "group":
        ws_result = await db.execute(
            select(GroupWorkSession).where(
                GroupWorkSession.id == data.submission_id,
                GroupWorkSession.assignment_id == assignment_id,
            )
        )
        session = ws_result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài nộp nhóm")
        session.teacher_score = data.score
        session.teacher_comment = data.comment
    elif data.submission_type == "group_member":
        # Grade individual member within a group
        if data.student_id is None:
            raise HTTPException(status_code=400, detail="student_id là bắt buộc cho group_member")

        print(f"[GRADE] Grading group member: assignment={assignment_id}, session={data.submission_id}, student_id={data.student_id}, score={data.score}")
        logger.info(f"[GRADE] Grading group member: assignment={assignment_id}, session={data.submission_id}, student_id={data.student_id}, score={data.score}")

        ws_result = await db.execute(
            select(GroupWorkSession).where(
                GroupWorkSession.id == data.submission_id,
                GroupWorkSession.assignment_id == assignment_id,
            )
        )
        session = ws_result.scalar_one_or_none()
        if not session:
            logger.error(f"[GRADE] Session not found: session_id={data.submission_id}, assignment_id={assignment_id}")
            raise HTTPException(status_code=404, detail="Không tìm thấy bài nộp nhóm")

        # Log current state
        print(f"[GRADE] Session found: id={session.id}, current member_grades={session.member_grades}")
        logger.info(f"[GRADE] Session found: id={session.id}, current member_grades={session.member_grades}")

        # Update member_grades JSON - create a new dict to ensure mutation is detected
        old_grades = session.member_grades
        member_grades = dict(old_grades) if old_grades else {}
        member_grades[str(data.student_id)] = {
            "score": data.score,
            "comment": data.comment or "",
        }
        session.member_grades = member_grades
        # Must flag_modified for SQLAlchemy to detect JSON field changes
        flag_modified(session, "member_grades")

        print(f"[GRADE] Updated member_grades: {session.member_grades}")
        logger.info(f"[GRADE] Updated member_grades: {session.member_grades}")
    else:
        raise HTTPException(status_code=400, detail="submission_type phải là 'individual', 'group', hoặc 'group_member'")

    await db.commit()

    # For group_member, verify the data was persisted
    if data.submission_type == "group_member":
        await db.refresh(session)
        print(f"[GRADE] After commit & refresh - member_grades in DB: {session.member_grades}")
        logger.info(f"[GRADE] After commit & refresh - member_grades in DB: {session.member_grades}")

    return {"success": True, "score": data.score, "comment": data.comment}


@router.get("/{assignment_id}/submissions")
async def get_submissions(
    assignment_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Xem danh sách bài nộp kèm nội dung câu hỏi"""
    result = await db.execute(
        select(ClassAssignment).where(ClassAssignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài giao")

    await _verify_teacher_owns_classroom(assignment.classroom_id, current_user, db)

    # Fetch content (questions) based on content_type
    content_data = None
    if assignment.content_type == "worksheet":
        ws_result = await db.execute(
            select(SharedWorksheet).where(SharedWorksheet.id == assignment.content_id)
        )
        worksheet = ws_result.scalar_one_or_none()
        if worksheet:
            content_data = {
                "title": worksheet.title,
                "questions": worksheet.questions or [],  # List of question objects
            }
    elif assignment.content_type == "quiz":
        quiz_result = await db.execute(
            select(SharedQuiz).where(SharedQuiz.id == assignment.content_id)
        )
        quiz = quiz_result.scalar_one_or_none()
        if quiz:
            content_data = {
                "title": quiz.title,
                "questions": quiz.questions or [],  # List of question objects
            }
    elif assignment.content_type == "code_exercise":
        code_result = await db.execute(
            select(CodeExercise).where(CodeExercise.id == assignment.content_id)
        )
        code_ex = code_result.scalar_one_or_none()
        if code_ex:
            content_data = {
                "title": code_ex.title,
                "description": code_ex.description,
                "starter_code": code_ex.starter_code,
            }

    if assignment.work_type == "group":
        sessions = await db.execute(
            select(GroupWorkSession)
            .where(GroupWorkSession.assignment_id == assignment_id)
            .options(
                selectinload(GroupWorkSession.group).selectinload(StudentGroup.members).selectinload(GroupMember.student)
            )
        )
        items = []
        for ws in sessions.scalars().all():
            items.append({
                "id": ws.id,
                "group_id": ws.group_id,
                "group_name": ws.group.name if ws.group else "",
                "status": ws.status,
                "answers": ws.answers,
                "leader_id": ws.leader_id,
                "teacher_score": ws.teacher_score,
                "teacher_comment": ws.teacher_comment,
                "member_grades": ws.member_grades,
                "member_evaluations": ws.member_evaluations,
                "submitted_at": ws.submitted_at.isoformat() if ws.submitted_at else None,
                "members": [
                    {"student_id": m.student_id, "full_name": m.student.full_name if m.student else ""}
                    for m in (ws.group.members if ws.group else [])
                ],
            })
        return {"work_type": "group", "submissions": items, "content": content_data}
    else:
        subs = await db.execute(
            select(IndividualSubmission)
            .where(IndividualSubmission.assignment_id == assignment_id)
            .options(selectinload(IndividualSubmission.student))
        )
        items = []
        for sub in subs.scalars().all():
            items.append({
                "id": sub.id,
                "student_id": sub.student_id,
                "student_name": sub.student.full_name if sub.student else "",
                "status": sub.status,
                "answers": sub.answers,
                "teacher_score": sub.teacher_score,
                "teacher_comment": sub.teacher_comment,
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
            })
        return {"work_type": "individual", "submissions": items, "content": content_data}


@router.get("/classroom/{classroom_id}/statistics")
async def get_classroom_statistics(
    classroom_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Thống kê bài tập theo bài học"""
    try:
        return await _get_classroom_statistics_impl(classroom_id, current_user, db)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in statistics endpoint for classroom {classroom_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")


async def _get_classroom_statistics_impl(
    classroom_id: int,
    current_user: User,
    db: AsyncSession,
):
    classroom = await _verify_teacher_owns_classroom(classroom_id, current_user, db)

    # Get all assignments for this classroom
    result = await db.execute(
        select(ClassAssignment)
        .where(ClassAssignment.classroom_id == classroom_id)
        .order_by(ClassAssignment.created_at.asc())
    )
    assignments = result.scalars().all()

    # Total students
    total_result = await db.execute(
        select(func.count(ClassStudent.id)).where(ClassStudent.classroom_id == classroom_id)
    )
    total_students = total_result.scalar() or 0

    # Pre-fetch classroom materials for lesson_info fallback
    mat_result = await db.execute(
        select(ClassroomMaterial).where(ClassroomMaterial.classroom_id == classroom_id)
    )
    material_lesson_map: dict[str, dict] = {}
    for m in mat_result.scalars().all():
        if m.lesson_info:
            material_lesson_map[f"{m.content_type}-{m.content_id}"] = m.lesson_info

    # Student ranking tracker: student_id -> {name, code, total_score, total_max, assignments_done}
    student_ranking: dict[int, dict] = {}

    # Group assignments by lesson
    lessons_map: dict = {}
    for a in assignments:
        li = a.lesson_info or material_lesson_map.get(f"{a.content_type}-{a.content_id}") or {}
        lesson_name = li.get("lesson_name", "Chưa phân loại")

        if lesson_name not in lessons_map:
            lessons_map[lesson_name] = []

        # Get submissions
        assignment_stats = {
            "id": a.id,
            "title": a.title,
            "content_type": a.content_type,
            "work_type": a.work_type,
            "total_students": total_students,
            "submitted_count": 0,
            "start_at": a.start_at.isoformat() if a.start_at else None,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "student_stats": [],
            "group_stats": [],
        }

        if a.work_type == "group":
            ws_result = await db.execute(
                select(GroupWorkSession)
                .where(GroupWorkSession.assignment_id == a.id)
                .options(
                    selectinload(GroupWorkSession.group)
                    .selectinload(StudentGroup.members)
                    .selectinload(GroupMember.student)
                )
            )
            sessions = ws_result.scalars().all()
            submitted = sum(1 for s in sessions if s.status == "submitted")
            assignment_stats["submitted_count"] = submitted

            for ws in sessions:
                members_list = []
                member_grades = ws.member_grades or {}
                for m in (ws.group.members if ws.group else []):
                    member_info = {
                        "student_id": m.student_id,
                        "full_name": m.student.full_name if m.student else "",
                        "student_code": m.student.student_code if m.student else "",
                    }
                    # Add grade if exists
                    if str(m.student_id) in member_grades:
                        mg = member_grades[str(m.student_id)]
                        member_info["teacher_score"] = mg.get("score")
                        member_info["teacher_comment"] = mg.get("comment", "")
                    members_list.append(member_info)

                    # Track ranking for group members
                    if ws.status == "submitted":
                        sid = m.student_id
                        if sid not in student_ranking:
                            student_ranking[sid] = {
                                "student_id": sid,
                                "student_name": m.student.full_name if m.student else "",
                                "student_code": m.student.student_code if m.student else "",
                                "total_score": 0,
                                "total_max": 0,
                                "assignments_submitted": 0,
                                "quiz_score": 0, "quiz_max": 0, "quiz_count": 0,
                                "code_score": 0, "code_max": 0, "code_count": 0,
                                "worksheet_score": 0, "worksheet_max": 0, "worksheet_count": 0,
                            }
                        student_ranking[sid]["assignments_submitted"] += 1
                        # Use member grade if available
                        if str(m.student_id) in member_grades:
                            mg = member_grades[str(m.student_id)]
                            score = mg.get("score", 0)
                            student_ranking[sid]["total_score"] += score
                            student_ranking[sid]["total_max"] += 10
                            if a.content_type == "code_exercise":
                                student_ranking[sid]["code_score"] += score
                                student_ranking[sid]["code_max"] += 10
                                student_ranking[sid]["code_count"] += 1
                            elif a.content_type == "worksheet":
                                student_ranking[sid]["worksheet_score"] += score
                                student_ranking[sid]["worksheet_max"] += 10
                                student_ranking[sid]["worksheet_count"] += 1

                group_stat = {
                    "group_id": ws.group_id,
                    "group_name": ws.group.name if ws.group else "",
                    "status": ws.status,
                    "submitted_at": ws.submitted_at.isoformat() if ws.submitted_at else None,
                    "member_evaluations": ws.member_evaluations,
                    "member_grades": ws.member_grades,
                    "teacher_score": ws.teacher_score,
                    "teacher_comment": ws.teacher_comment,
                    "session_id": ws.id,
                    "members": members_list,
                }
                # Score for code exercises
                answers = ws.answers or {}
                if a.content_type == "code_exercise" and "test_result" in answers:
                    tr = answers["test_result"]
                    group_stat["score"] = {
                        "passed_tests": tr.get("passed_tests", 0),
                        "total_tests": tr.get("total_tests", 0),
                    }
                assignment_stats["group_stats"].append(group_stat)
        else:
            subs_result = await db.execute(
                select(IndividualSubmission)
                .where(IndividualSubmission.assignment_id == a.id)
                .options(selectinload(IndividualSubmission.student))
            )
            subs = subs_result.scalars().all()
            submitted = sum(1 for s in subs if s.status == "submitted")
            assignment_stats["submitted_count"] = submitted

            # For quiz: load quiz to compute scores
            quiz_questions = None
            if a.content_type == "quiz":
                q_result = await db.execute(
                    select(SharedQuiz).where(SharedQuiz.id == a.content_id)
                )
                quiz = q_result.scalar_one_or_none()
                if quiz and quiz.questions:
                    quiz_questions = quiz.questions

            for sub in subs:
                student_stat = {
                    "student_id": sub.student_id,
                    "student_name": sub.student.full_name if sub.student else "",
                    "student_code": sub.student.student_code if sub.student else "",
                    "status": sub.status,
                    "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
                    "teacher_score": sub.teacher_score,
                    "teacher_comment": sub.teacher_comment,
                    "submission_id": sub.id,
                }

                # Initialize ranking entry
                sid = sub.student_id
                if sid not in student_ranking:
                    student_ranking[sid] = {
                        "student_id": sid,
                        "student_name": sub.student.full_name if sub.student else "",
                        "student_code": sub.student.student_code if sub.student else "",
                        "total_score": 0,
                        "total_max": 0,
                        "assignments_submitted": 0,
                        "quiz_score": 0, "quiz_max": 0, "quiz_count": 0,
                        "code_score": 0, "code_max": 0, "code_count": 0,
                        "worksheet_score": 0, "worksheet_max": 0, "worksheet_count": 0,
                    }

                answers = sub.answers or {}
                score_earned = 0
                score_max = 0

                if a.content_type == "quiz" and quiz_questions:
                    correct = 0
                    total_q = len(quiz_questions)
                    for q in quiz_questions:
                        q_id = str(q.get("id", q.get("question_id", "")))
                        student_answer = answers.get(q_id)
                        correct_answer = q.get("correct_answer", q.get("correctAnswer"))
                        if student_answer is not None and str(student_answer) == str(correct_answer):
                            correct += 1
                    student_stat["score"] = {"total_correct": correct, "total_questions": total_q}
                    score_earned = correct
                    score_max = total_q
                elif a.content_type == "code_exercise":
                    if sub.teacher_score is not None:
                        # Teacher graded: use teacher_score (out of 10)
                        student_stat["score"] = {"teacher_score": sub.teacher_score, "max_score": 10}
                        score_earned = sub.teacher_score
                        score_max = 10
                    elif "test_result" in answers:
                        tr = answers["test_result"]
                        passed = tr.get("passed_tests", 0)
                        total = tr.get("total_tests", 0)
                        student_stat["score"] = {"passed_tests": passed, "total_tests": total}
                        score_earned = passed
                        score_max = total
                    elif sub.status == "submitted":
                        student_stat["score"] = {"passed_tests": 0, "total_tests": 0, "no_test": True}
                elif a.content_type == "worksheet":
                    if sub.teacher_score is not None:
                        student_stat["score"] = {"teacher_score": sub.teacher_score, "max_score": 10}
                        score_earned = sub.teacher_score
                        score_max = 10

                # Track ranking for submitted work
                if sub.status == "submitted":
                    student_ranking[sid]["assignments_submitted"] += 1
                    student_ranking[sid]["total_score"] += score_earned
                    student_ranking[sid]["total_max"] += score_max
                    if a.content_type == "quiz":
                        student_ranking[sid]["quiz_score"] += score_earned
                        student_ranking[sid]["quiz_max"] += score_max
                        student_ranking[sid]["quiz_count"] += 1
                    elif a.content_type == "code_exercise":
                        student_ranking[sid]["code_score"] += score_earned
                        student_ranking[sid]["code_max"] += score_max
                        student_ranking[sid]["code_count"] += 1
                    elif a.content_type == "worksheet":
                        student_ranking[sid]["worksheet_score"] += score_earned
                        student_ranking[sid]["worksheet_max"] += score_max
                        student_ranking[sid]["worksheet_count"] += 1

                assignment_stats["student_stats"].append(student_stat)

        lessons_map[lesson_name].append(assignment_stats)

    # Build student ranking sorted by score percentage then total score
    ranking_list = sorted(
        student_ranking.values(),
        key=lambda x: (
            (x["total_score"] / x["total_max"] * 100) if x["total_max"] > 0 else 0,
            x["total_score"],
            x["assignments_submitted"],
        ),
        reverse=True,
    )
    # Add rank numbers
    for i, r in enumerate(ranking_list):
        r["rank"] = i + 1

    # Build response
    lessons = [
        {"lesson_name": name, "assignments": items}
        for name, items in lessons_map.items()
    ]

    return {
        "lessons": lessons,
        "total_students": total_students,
        "student_ranking": ranking_list,
    }
