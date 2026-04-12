"""
API Routes cho nhận xét GV trên KHBD + phân tích AI ngầm.
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.saved_lesson_plan import SavedLessonPlan
from app.models.lesson_plan_comment import LessonPlanComment
from app.models.teaching_rule import TeachingRule
from app.services.comment_analysis_service import run_background_analysis

router = APIRouter(prefix="/lesson-plans", tags=["lesson-plan-comments"])


# --- Schemas ---

class CommentCreate(BaseModel):
    selected_text: str | None = Field(None, min_length=1)
    context_before: str | None = Field(None, max_length=200)
    context_after: str | None = Field(None, max_length=200)
    section_type: str | None = Field(None, max_length=50)
    comment_text: str = Field(..., min_length=1, max_length=500)
    parent_comment_id: int | None = None


class CommentUpdate(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=500)


class CommentResolve(BaseModel):
    resolved: bool = True


class CommentResponse(BaseModel):
    id: int
    parent_comment_id: int | None
    selected_text: str
    context_before: str | None
    context_after: str | None
    section_type: str | None
    comment_text: str
    is_resolved: bool
    resolved_at: str | None
    resolved_by: int | None
    rule_id: int | None
    analysis_status: str
    created_at: str

    class Config:
        from_attributes = True


# --- Routes ---

@router.post("/{lesson_plan_id}/comments", status_code=201)
async def create_comment(
    lesson_plan_id: int,
    body: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lưu 1 comment (auto-save). Tự trigger phân tích ngầm."""
    # Kiểm tra quyền
    plan = await db.get(SavedLessonPlan, lesson_plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "KHBD không tồn tại")

    parent_comment = None
    if body.parent_comment_id is not None:
        parent_comment = await db.get(LessonPlanComment, body.parent_comment_id)
        if (
            not parent_comment
            or parent_comment.lesson_plan_id != lesson_plan_id
            or parent_comment.teacher_id != current_user.id
        ):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Comment cha không tồn tại")

    comment_text = body.comment_text.strip()
    if body.parent_comment_id is None and len(comment_text) < 10:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Nội dung bình luận gốc tối thiểu 10 ký tự",
        )

    selected_text = (body.selected_text or "").strip()
    if parent_comment is not None and not selected_text:
        selected_text = (parent_comment.selected_text or "").strip()
    if not selected_text:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Thiếu đoạn text được bình luận")

    # Chỉ dùng 1 cấp thread (comment gốc + replies)
    thread_parent_id = None
    if parent_comment is not None:
        thread_parent_id = (
            parent_comment.id
            if parent_comment.parent_comment_id is None
            else parent_comment.parent_comment_id
        )

    comment = LessonPlanComment(
        lesson_plan_id=lesson_plan_id,
        teacher_id=current_user.id,
        selected_text=selected_text,
        context_before=body.context_before if parent_comment is None else parent_comment.context_before,
        context_after=body.context_after if parent_comment is None else parent_comment.context_after,
        section_type=body.section_type if parent_comment is None else parent_comment.section_type,
        comment_text=comment_text,
        parent_comment_id=thread_parent_id,
        analysis_status="pending" if parent_comment is None else "skipped",
    )
    db.add(comment)

    # Trả lời vào thread đã resolve => tự reopen thread
    if thread_parent_id is not None:
        await db.execute(
            update(LessonPlanComment)
            .where(
                LessonPlanComment.lesson_plan_id == lesson_plan_id,
                LessonPlanComment.teacher_id == current_user.id,
                (LessonPlanComment.id == thread_parent_id)
                | (LessonPlanComment.parent_comment_id == thread_parent_id),
            )
            .values(is_resolved=False, resolved_at=None, resolved_by=None)
        )

    await db.commit()
    await db.refresh(comment)

    return {
        "id": comment.id,
        "created_at": str(comment.created_at),
        "parent_comment_id": comment.parent_comment_id,
    }


@router.get("/{lesson_plan_id}/comments")
async def get_comments(
    lesson_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lấy tất cả comments của KHBD (hiển thị highlights khi mở lại)."""
    plan = await db.get(SavedLessonPlan, lesson_plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "KHBD không tồn tại")

    result = await db.execute(
        select(LessonPlanComment)
        .where(
            LessonPlanComment.lesson_plan_id == lesson_plan_id,
            LessonPlanComment.teacher_id == current_user.id,
        )
        .order_by(LessonPlanComment.created_at)
    )
    comments = result.scalars().all()
    return [
        {
            "id": c.id,
            "parent_comment_id": c.parent_comment_id,
            "selected_text": c.selected_text,
            "context_before": c.context_before,
            "context_after": c.context_after,
            "section_type": c.section_type,
            "comment_text": c.comment_text,
            "is_resolved": c.is_resolved,
            "resolved_at": str(c.resolved_at) if c.resolved_at else None,
            "resolved_by": c.resolved_by,
            "rule_id": c.rule_id,
            "analysis_status": c.analysis_status,
            "created_at": str(c.created_at),
        }
        for c in comments
    ]


@router.put("/{lesson_plan_id}/comments/{comment_id}")
async def update_comment(
    lesson_plan_id: int,
    comment_id: int,
    body: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sửa comment → reset analysis, deactivate old rule."""
    comment = await db.get(LessonPlanComment, comment_id)
    if (
        not comment
        or comment.lesson_plan_id != lesson_plan_id
        or comment.teacher_id != current_user.id
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Comment không tồn tại")

    # Deactivate old rule nếu có
    if comment.rule_id:
        await db.execute(
            update(TeachingRule)
            .where(TeachingRule.id == comment.rule_id)
            .values(is_active=False)
        )

    comment.comment_text = body.comment_text.strip()
    comment.analysis_status = "pending" if comment.parent_comment_id is None else "skipped"
    comment.rule_id = None
    await db.commit()
    return {"status": "updated"}


@router.delete("/{lesson_plan_id}/comments/{comment_id}")
async def delete_comment(
    lesson_plan_id: int,
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Xóa comment + deactivate linked rule."""
    comment = await db.get(LessonPlanComment, comment_id)
    if (
        not comment
        or comment.lesson_plan_id != lesson_plan_id
        or comment.teacher_id != current_user.id
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Comment không tồn tại")

    # Deactivate linked rule
    if comment.rule_id:
        await db.execute(
            update(TeachingRule)
            .where(TeachingRule.id == comment.rule_id)
            .values(is_active=False)
        )

    await db.delete(comment)
    await db.commit()
    return {"status": "deleted"}


@router.post("/{lesson_plan_id}/analyze-comments")
async def analyze_comments(
    lesson_plan_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger phân tích AI ngầm. Chạy background, tự cập nhật DB khi xong."""
    plan = await db.get(SavedLessonPlan, lesson_plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "KHBD không tồn tại")

    # Đánh dấu pending → processing (tránh trigger trùng)
    result = await db.execute(
        update(LessonPlanComment)
        .where(
            LessonPlanComment.lesson_plan_id == lesson_plan_id,
            LessonPlanComment.teacher_id == current_user.id,
            LessonPlanComment.analysis_status == "pending",
            LessonPlanComment.parent_comment_id.is_(None),
            LessonPlanComment.is_resolved == False,  # noqa: E712
        )
        .values(analysis_status="processing")
        .returning(LessonPlanComment.id)
    )
    processing_ids = [row[0] for row in result.all()]
    await db.commit()

    if not processing_ids:
        return {"status": "no_pending", "count": 0}

    # Chạy ngầm — không block response
    background_tasks.add_task(
        run_background_analysis, lesson_plan_id, current_user.id
    )

    return {"status": "processing", "count": len(processing_ids)}


@router.post("/{lesson_plan_id}/comments/{comment_id}/resolve")
async def resolve_comment_thread(
    lesson_plan_id: int,
    comment_id: int,
    body: CommentResolve,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resolve/unresolve 1 thread comment kiểu Docs/Word."""
    comment = await db.get(LessonPlanComment, comment_id)
    if (
        not comment
        or comment.lesson_plan_id != lesson_plan_id
        or comment.teacher_id != current_user.id
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Comment không tồn tại")

    thread_root_id = comment.id if comment.parent_comment_id is None else comment.parent_comment_id
    values = {
        "is_resolved": body.resolved,
        "resolved_by": current_user.id if body.resolved else None,
        "resolved_at": func.now() if body.resolved else None,
    }

    await db.execute(
        update(LessonPlanComment)
        .where(
            LessonPlanComment.lesson_plan_id == lesson_plan_id,
            LessonPlanComment.teacher_id == current_user.id,
            (LessonPlanComment.id == thread_root_id)
            | (LessonPlanComment.parent_comment_id == thread_root_id),
        )
        .values(**values)
    )
    await db.commit()
    return {
        "status": "resolved" if body.resolved else "unresolved",
        "thread_id": thread_root_id,
    }
