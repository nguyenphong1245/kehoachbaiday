"""
Admin routes - Dashboard stats, content management
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Any

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.models.association import user_roles_table
from app.models.saved_lesson_plan import SavedLessonPlan
from app.models.shared_quiz import SharedQuiz, QuizResponse
from app.models.shared_worksheet import SharedWorksheet, WorksheetResponse
from app.models.code_exercise import CodeExercise, CodeSubmission
from app.models.classroom import Classroom
from app.models.class_student import ClassStudent
from app.models.classroom_material import ClassroomMaterial
from pydantic import BaseModel
from app.schemas.admin import (
    DashboardStats,
    RecentUser,
    TopTeacher,
    ContentItem,
    ContentListResponse,
)


class TokenBalanceUpdate(BaseModel):
    token_balance: int

router = APIRouter()


@router.get("/dashboard-stats", response_model=DashboardStats, dependencies=[Depends(require_admin)])
async def get_dashboard_stats(session: AsyncSession = Depends(get_db)):
    """Thống kê tổng quan cho admin dashboard"""

    # User counts
    total_users = (await session.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await session.execute(select(func.count(User.id)).where(User.is_active == True))).scalar() or 0
    verified_users = (await session.execute(select(func.count(User.id)).where(User.is_verified == True))).scalar() or 0

    # Content counts
    total_lesson_plans = (await session.execute(select(func.count(SavedLessonPlan.id)))).scalar() or 0
    total_quizzes = (await session.execute(select(func.count(SharedQuiz.id)))).scalar() or 0
    total_worksheets = (await session.execute(select(func.count(SharedWorksheet.id)))).scalar() or 0
    total_code_exercises = (await session.execute(select(func.count(CodeExercise.id)))).scalar() or 0

    # Response counts
    total_quiz_responses = (await session.execute(select(func.count(QuizResponse.id)))).scalar() or 0
    total_worksheet_responses = (await session.execute(select(func.count(WorksheetResponse.id)))).scalar() or 0
    total_code_submissions = (await session.execute(select(func.count(CodeSubmission.id)))).scalar() or 0

    # Get teacher role
    teacher_role_result = await session.execute(
        select(Role).where(Role.name == "teacher")
    )
    teacher_role = teacher_role_result.scalar_one_or_none()

    # Recent teachers (5 newest users with teacher role)
    recent_users = []
    if teacher_role:
        recent_result = await session.execute(
            select(User)
            .join(user_roles_table, User.id == user_roles_table.c.user_id)
            .where(user_roles_table.c.role_id == teacher_role.id)
            .order_by(User.created_at.desc())
            .limit(5)
        )
        recent_users = [
            RecentUser(
                id=u.id,
                email=u.email,
                is_active=u.is_active,
                is_verified=u.is_verified,
                created_at=u.created_at,
            )
            for u in recent_result.scalars().all()
        ]

    # Top teachers (by tokens_used) - show all teachers sorted by usage
    top_teachers = []
    if teacher_role:
        top_result = await session.execute(
            select(User)
            .join(user_roles_table, User.id == user_roles_table.c.user_id)
            .where(user_roles_table.c.role_id == teacher_role.id)
            .order_by(User.tokens_used.desc(), User.created_at.desc())
            .limit(5)
        )
        top_teachers = [
            TopTeacher(
                id=u.id,
                email=u.email,
                tokens_used=u.tokens_used,
                token_balance=u.token_balance,
            )
            for u in top_result.scalars().all()
        ]

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        verified_users=verified_users,
        total_lesson_plans=total_lesson_plans,
        total_quizzes=total_quizzes,
        total_worksheets=total_worksheets,
        total_code_exercises=total_code_exercises,
        total_quiz_responses=total_quiz_responses,
        total_worksheet_responses=total_worksheet_responses,
        total_code_submissions=total_code_submissions,
        recent_users=recent_users,
        top_teachers=top_teachers,
    )


@router.get("/all-content", response_model=ContentListResponse, dependencies=[Depends(require_admin)])
async def get_all_content(
    content_type: str = Query("all"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=10000),
    session: AsyncSession = Depends(get_db),
):
    """Lấy danh sách tất cả nội dung trên hệ thống"""
    items: list[ContentItem] = []
    offset = (page - 1) * limit

    if content_type in ("all", "quiz"):
        qr_count = (
            select(func.count(QuizResponse.id))
            .where(QuizResponse.quiz_id == SharedQuiz.id)
            .correlate(SharedQuiz)
            .scalar_subquery()
        )
        result = await session.execute(
            select(
                SharedQuiz.id, SharedQuiz.title, SharedQuiz.creator_id,
                SharedQuiz.created_at, SharedQuiz.is_active,
                SharedQuiz.lesson_info, SharedQuiz.share_code, SharedQuiz.content,
                User.email, qr_count.label("resp_count"),
            )
            .join(User, SharedQuiz.creator_id == User.id)
        )
        for row in result.all():
            items.append(ContentItem(
                id=row.id, type="quiz", title=row.title,
                creator_email=row.email, creator_id=row.creator_id,
                created_at=row.created_at, is_active=row.is_active,
                response_count=row.resp_count or 0,
                lesson_info=row.lesson_info, share_code=row.share_code,
                content=row.content,
            ))

    if content_type in ("all", "worksheet"):
        wr_count = (
            select(func.count(WorksheetResponse.id))
            .where(WorksheetResponse.worksheet_id == SharedWorksheet.id)
            .correlate(SharedWorksheet)
            .scalar_subquery()
        )
        result = await session.execute(
            select(
                SharedWorksheet.id, SharedWorksheet.title, SharedWorksheet.user_id,
                SharedWorksheet.created_at, SharedWorksheet.is_active,
                SharedWorksheet.lesson_info, SharedWorksheet.share_code, SharedWorksheet.content,
                User.email, wr_count.label("resp_count"),
            )
            .join(User, SharedWorksheet.user_id == User.id)
        )
        for row in result.all():
            items.append(ContentItem(
                id=row.id, type="worksheet", title=row.title,
                creator_email=row.email, creator_id=row.user_id,
                created_at=row.created_at, is_active=row.is_active,
                response_count=row.resp_count or 0,
                lesson_info=row.lesson_info, share_code=row.share_code,
                content=row.content,
            ))

    if content_type in ("all", "code_exercise"):
        cs_count = (
            select(func.count(CodeSubmission.id))
            .where(CodeSubmission.exercise_id == CodeExercise.id)
            .correlate(CodeExercise)
            .scalar_subquery()
        )
        result = await session.execute(
            select(
                CodeExercise.id, CodeExercise.title, CodeExercise.creator_id,
                CodeExercise.created_at, CodeExercise.is_active,
                CodeExercise.lesson_info, CodeExercise.share_code,
                CodeExercise.problem_statement,
                User.email, cs_count.label("resp_count"),
            )
            .join(User, CodeExercise.creator_id == User.id)
        )
        for row in result.all():
            items.append(ContentItem(
                id=row.id, type="code_exercise", title=row.title,
                creator_email=row.email, creator_id=row.creator_id,
                created_at=row.created_at, is_active=row.is_active,
                response_count=row.resp_count or 0,
                lesson_info=row.lesson_info, share_code=row.share_code,
                content=row.problem_statement,
            ))

    if content_type in ("all", "lesson_plan"):
        result = await session.execute(
            select(
                SavedLessonPlan.id, SavedLessonPlan.title, SavedLessonPlan.user_id,
                SavedLessonPlan.created_at, SavedLessonPlan.content,
                SavedLessonPlan.lesson_name, SavedLessonPlan.grade,
                SavedLessonPlan.book_type,
                User.email,
            )
            .join(User, SavedLessonPlan.user_id == User.id)
        )
        for row in result.all():
            lp_lesson_info = None
            if row.lesson_name:
                lp_lesson_info = {
                    "lesson_name": row.lesson_name,
                    "grade": row.grade,
                    "book_type": row.book_type,
                }
            items.append(ContentItem(
                id=row.id, type="lesson_plan", title=row.title,
                creator_email=row.email, creator_id=row.user_id,
                created_at=row.created_at, is_active=None,
                response_count=0, lesson_info=lp_lesson_info,
                content=row.content,
            ))

    # Sort all by created_at desc
    items.sort(key=lambda x: x.created_at, reverse=True)
    total = len(items)
    paged = items[offset : offset + limit]

    return ContentListResponse(items=paged, total=total, page=page, limit=limit)


@router.delete("/content/{content_type}/{content_id}", dependencies=[Depends(require_admin)])
async def delete_content(
    content_type: str,
    content_id: int,
    session: AsyncSession = Depends(get_db),
):
    """Admin xóa nội dung không phù hợp"""
    model_map = {
        "quiz": SharedQuiz,
        "worksheet": SharedWorksheet,
        "code_exercise": CodeExercise,
        "lesson_plan": SavedLessonPlan,
    }

    model = model_map.get(content_type)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại nội dung không hợp lệ")

    item = await session.get(model, content_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy nội dung")

    await session.delete(item)
    await session.commit()

    return {"message": "Đã xóa nội dung thành công"}


@router.put("/users/{user_id}/token-balance", dependencies=[Depends(require_admin)])
async def update_token_balance(
    user_id: int,
    payload: TokenBalanceUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Admin cập nhật hạn mức token cho người dùng"""
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng")

    user.token_balance = payload.token_balance
    await session.commit()

    return {"message": f"Đã cập nhật token thành {payload.token_balance}", "token_balance": user.token_balance}


@router.get("/teachers-overview", dependencies=[Depends(require_admin)])
async def get_teachers_overview(session: AsyncSession = Depends(get_db)) -> list[dict[str, Any]]:
    """
    Get overview of all teachers with their classrooms, materials, and students.
    Returns teachers organized by their classrooms.
    """
    # Get teacher role
    teacher_role_result = await session.execute(
        select(Role).where(Role.name == "teacher")
    )
    teacher_role = teacher_role_result.scalar_one_or_none()
    if not teacher_role:
        return []

    # Get all users with teacher role
    teachers_result = await session.execute(
        select(User)
        .join(user_roles_table, User.id == user_roles_table.c.user_id)
        .where(user_roles_table.c.role_id == teacher_role.id)
        .options(selectinload(User.roles))
    )
    teachers = teachers_result.scalars().all()

    result = []
    for teacher in teachers:
        # Get classrooms for this teacher
        classrooms_result = await session.execute(
            select(Classroom)
            .where(Classroom.teacher_id == teacher.id)
            .order_by(Classroom.created_at.desc())
        )
        classrooms = classrooms_result.scalars().all()

        teacher_data = {
            "id": teacher.id,
            "email": teacher.email,
            "token_balance": teacher.token_balance,
            "tokens_used": teacher.tokens_used,
            "created_at": teacher.created_at.isoformat() if teacher.created_at else None,
            "classrooms": [],
        }

        for classroom in classrooms:
            # Get student count
            student_count_result = await session.execute(
                select(func.count(ClassStudent.id))
                .where(ClassStudent.classroom_id == classroom.id)
            )
            student_count = student_count_result.scalar() or 0

            # Get students list
            students_result = await session.execute(
                select(ClassStudent)
                .where(ClassStudent.classroom_id == classroom.id)
                .order_by(ClassStudent.student_number, ClassStudent.full_name)
            )
            students = students_result.scalars().all()

            # Get materials count by type
            materials_result = await session.execute(
                select(
                    ClassroomMaterial.content_type,
                    func.count(ClassroomMaterial.id).label("count")
                )
                .where(ClassroomMaterial.classroom_id == classroom.id)
                .group_by(ClassroomMaterial.content_type)
            )
            materials_counts = {row.content_type: row.count for row in materials_result.all()}

            classroom_data = {
                "id": classroom.id,
                "name": classroom.name,
                "grade": classroom.grade,
                "school_year": classroom.school_year,
                "description": classroom.description,
                "created_at": classroom.created_at.isoformat() if classroom.created_at else None,
                "student_count": student_count,
                "materials": {
                    "quiz": materials_counts.get("quiz", 0),
                    "worksheet": materials_counts.get("worksheet", 0),
                    "code_exercise": materials_counts.get("code_exercise", 0),
                    "total": sum(materials_counts.values()),
                },
                "students": [
                    {
                        "id": s.id,
                        "full_name": s.full_name,
                        "student_code": s.student_code,
                        "student_number": s.student_number,
                    }
                    for s in students
                ],
            }
            teacher_data["classrooms"].append(classroom_data)

        # Add summary stats
        teacher_data["total_classrooms"] = len(classrooms)
        teacher_data["total_students"] = sum(c["student_count"] for c in teacher_data["classrooms"])
        teacher_data["total_materials"] = sum(c["materials"]["total"] for c in teacher_data["classrooms"])

        result.append(teacher_data)

    # Sort by total classrooms descending
    result.sort(key=lambda x: x["total_classrooms"], reverse=True)

    return result
