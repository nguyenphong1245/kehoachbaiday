"""
API routes cho quản lý nội dung sách giáo khoa (lesson_contents)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.lesson_content import LessonContent
from app.models.user import User

router = APIRouter()


# Pydantic schemas
class LessonContentBase(BaseModel):
    neo4j_lesson_id: str
    lesson_name: str
    content: Optional[str] = None


class LessonContentCreate(LessonContentBase):
    pass


class LessonContentUpdate(BaseModel):
    lesson_name: Optional[str] = None
    content: Optional[str] = None


class LessonContentResponse(LessonContentBase):
    id: int

    class Config:
        from_attributes = True


class LessonContentListItem(BaseModel):
    """Schema nhẹ cho list view - không bao gồm content đầy đủ"""
    id: int
    neo4j_lesson_id: str
    lesson_name: str
    content_preview: Optional[str] = None  # Chỉ 200 ký tự đầu

    class Config:
        from_attributes = True


# Routes
@router.get("", response_model=List[LessonContentListItem])
async def get_lesson_contents(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy danh sách nội dung SGK"""
    query = select(LessonContent)
    
    if search:
        query = query.where(LessonContent.lesson_name.ilike(f"%{search}%"))
    
    query = query.order_by(LessonContent.neo4j_lesson_id).offset(skip).limit(limit)
    result = await session.execute(query)
    lessons = result.scalars().all()
    
    # Convert to list items with content preview
    items = []
    for lesson in lessons:
        items.append(LessonContentListItem(
            id=lesson.id,
            neo4j_lesson_id=lesson.neo4j_lesson_id,
            lesson_name=lesson.lesson_name,
            content_preview=lesson.content[:200] + "..." if lesson.content and len(lesson.content) > 200 else lesson.content
        ))
    
    return items


@router.get("/stats")
async def get_lesson_stats(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy thống kê bài học"""
    # Total count
    total_result = await session.execute(select(func.count(LessonContent.id)))
    total = total_result.scalar()
    
    return {
        "total": total
    }


@router.get("/{lesson_id}", response_model=LessonContentResponse)
async def get_lesson_content(
    lesson_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy chi tiết một bài học (bao gồm content đầy đủ)"""
    lesson = await session.get(LessonContent, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    return lesson


@router.put("/{lesson_id}", response_model=LessonContentResponse)
async def update_lesson_content(
    lesson_id: int,
    update_data: LessonContentUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cập nhật nội dung bài học"""
    lesson = await session.get(LessonContent, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    
    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(lesson, key, value)
    
    await session.commit()
    await session.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}")
async def delete_lesson_content(
    lesson_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Xóa một bài học"""
    lesson = await session.get(LessonContent, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    
    await session.delete(lesson)
    await session.commit()
    return {"message": "Đã xóa bài học thành công"}
