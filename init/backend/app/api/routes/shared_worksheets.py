"""
API Routes cho Phiếu học tập chia sẻ
"""
import secrets
import re
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.shared_worksheet import SharedWorksheet, WorksheetResponse
from app.schemas.shared_worksheet import (
    CreateSharedWorksheetRequest,
    CreateSharedWorksheetResponse,
    UpdateWorksheetRequest,
    SharedWorksheetResponse,
    SharedWorksheetListResponse,
    WorksheetResponsesListResponse,
    WorksheetResponseItem,
)
from app.core.config import get_settings

router = APIRouter(prefix="/worksheets", tags=["Shared Worksheets"])
logger = logging.getLogger(__name__)


def generate_share_code() -> str:
    """Tạo mã chia sẻ ngẫu nhiên 8 ký tự"""
    return secrets.token_urlsafe(6)[:8]


def parse_questions_from_content(content: str) -> list:
    """
    Parse nội dung phiếu học tập thành danh sách câu hỏi
    Tìm các pattern như: Câu 1:, Câu 2:, etc.
    """
    questions = []
    
    # Pattern tìm câu hỏi
    pattern = r'(?:\*\*)?Câu\s*(\d+)[:\.]?\s*(?:\*\*)?\s*(.+?)(?=(?:\*\*)?Câu\s*\d+[:\.]?|\Z)'
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
    
    for idx, (num, text) in enumerate(matches):
        # Làm sạch text
        clean_text = text.strip()
        # Loại bỏ các dòng chấm (......)
        clean_text = re.sub(r'\.{5,}', '', clean_text)
        clean_text = re.sub(r'\n\s*\n', '\n', clean_text).strip()
        
        questions.append({
            "id": f"q{num}",
            "number": int(num),
            "text": clean_text,
            "type": "text"
        })
    
    return questions


# ============== AUTHENTICATED ENDPOINTS (Giáo viên) ==============

@router.post("/share", response_model=CreateSharedWorksheetResponse)
async def create_shared_worksheet(
    request: CreateSharedWorksheetRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tạo phiếu học tập chia sẻ mới"""
    share_code = generate_share_code()
    
    # Log content để debug
    logger.info(f"[SHARE] Creating worksheet. Title: {request.title}")
    logger.info(f"[SHARE] Content length: {len(request.content)} characters")
    logger.info(f"[SHARE] Content preview: {request.content[:200]}...")
    
    # Parse câu hỏi từ nội dung
    questions = parse_questions_from_content(request.content)
    logger.info(f"[SHARE] Parsed {len(questions)} questions from content")
    
    if len(questions) == 0:
        logger.warning(f"[SHARE] No questions found in content! Content: {request.content[:500]}")
    
    # Tính thời gian hết hạn
    expires_at = None
    if request.expires_hours:
        expires_at = datetime.utcnow() + timedelta(hours=request.expires_hours)
    
    worksheet = SharedWorksheet(
        share_code=share_code,
        user_id=current_user.id,
        title=request.title,
        content=request.content,
        lesson_info=request.lesson_info,
        questions=questions,
        expires_at=expires_at,
        max_submissions=request.max_submissions,
        is_active=True,
    )
    
    db.add(worksheet)
    await db.commit()
    await db.refresh(worksheet)
    
    # Tạo URL chia sẻ (sử dụng frontend URL, không phải backend)
    settings = get_settings()
    frontend_url = settings.frontend_base_url.rstrip('/')
    share_url = f"{frontend_url}/worksheet/{share_code}"
    
    logger.info(f"Created shared worksheet {worksheet.id} by user {current_user.id}")
    
    return CreateSharedWorksheetResponse(
        id=worksheet.id,
        share_code=share_code,
        share_url=share_url,
        title=worksheet.title,
        message="Đã tạo phiếu học tập chia sẻ thành công!"
    )


@router.get("/my-worksheets", response_model=SharedWorksheetListResponse)
async def get_my_shared_worksheets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy danh sách phiếu học tập đã chia sẻ của giáo viên"""
    query = select(SharedWorksheet).where(
        SharedWorksheet.user_id == current_user.id
    ).order_by(SharedWorksheet.created_at.desc())
    
    result = await db.execute(query)
    worksheets = result.scalars().all()
    
    # Sử dụng frontend URL
    settings = get_settings()
    frontend_url = settings.frontend_base_url.rstrip('/')
    
    worksheet_list = []
    for ws in worksheets:
        # Count responses
        count_query = select(func.count(WorksheetResponse.id)).where(
            WorksheetResponse.worksheet_id == ws.id
        )
        count_result = await db.execute(count_query)
        response_count = count_result.scalar() or 0
        
        worksheet_list.append(SharedWorksheetResponse(
            id=ws.id,
            share_code=ws.share_code,
            share_url=f"{frontend_url}/worksheet/{ws.share_code}",
            title=ws.title,
            is_active=ws.is_active,
            expires_at=ws.expires_at,
            max_submissions=ws.max_submissions,
            response_count=response_count,
            created_at=ws.created_at,
            lesson_info=ws.lesson_info,
        ))
    
    return SharedWorksheetListResponse(
        worksheets=worksheet_list,
        total=len(worksheet_list)
    )


@router.get("/{worksheet_id}/responses", response_model=WorksheetResponsesListResponse)
async def get_worksheet_responses(
    worksheet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Xem danh sách câu trả lời của học sinh cho một phiếu"""
    query = select(SharedWorksheet).where(
        SharedWorksheet.id == worksheet_id,
        SharedWorksheet.user_id == current_user.id
    )
    result = await db.execute(query)
    worksheet = result.scalar_one_or_none()
    
    if not worksheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiếu học tập"
        )
    
    responses_query = select(WorksheetResponse).where(
        WorksheetResponse.worksheet_id == worksheet_id
    ).order_by(WorksheetResponse.submitted_at.desc())
    
    responses_result = await db.execute(responses_query)
    responses = responses_result.scalars().all()
    
    return WorksheetResponsesListResponse(
        worksheet_id=worksheet_id,
        title=worksheet.title,
        total_responses=len(responses),
        responses=[
            WorksheetResponseItem(
                id=r.id,
                student_name=r.student_name,
                student_class=r.student_class,
                answers=r.answers,
                submitted_at=r.submitted_at,
            )
            for r in responses
        ]
    )


@router.delete("/{worksheet_id}")
async def delete_shared_worksheet(
    worksheet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Xóa phiếu học tập chia sẻ"""
    query = select(SharedWorksheet).where(
        SharedWorksheet.id == worksheet_id,
        SharedWorksheet.user_id == current_user.id
    )
    result = await db.execute(query)
    worksheet = result.scalar_one_or_none()
    
    if not worksheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiếu học tập"
        )

    # Cascade: xóa học liệu tham chiếu trong các lớp học
    from app.models.classroom_material import ClassroomMaterial
    from sqlalchemy import delete as sql_delete
    await db.execute(
        sql_delete(ClassroomMaterial).where(
            ClassroomMaterial.content_type == "worksheet",
            ClassroomMaterial.content_id == worksheet_id,
        )
    )

    await db.delete(worksheet)
    await db.commit()

    return {"message": "Đã xóa phiếu học tập"}


@router.get("/{worksheet_id}/detail")
async def get_worksheet_detail(
    worksheet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy chi tiết phiếu học tập (bao gồm content) - chỉ dành cho chủ sở hữu"""
    query = select(SharedWorksheet).where(
        SharedWorksheet.id == worksheet_id,
        SharedWorksheet.user_id == current_user.id
    )
    result = await db.execute(query)
    worksheet = result.scalar_one_or_none()

    if not worksheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiếu học tập"
        )

    return {
        "id": worksheet.id,
        "title": worksheet.title,
        "content": worksheet.content,
    }


@router.patch("/{worksheet_id}")
async def update_worksheet(
    worksheet_id: int,
    request: UpdateWorksheetRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cập nhật nội dung phiếu học tập"""
    query = select(SharedWorksheet).where(
        SharedWorksheet.id == worksheet_id,
        SharedWorksheet.user_id == current_user.id
    )
    result = await db.execute(query)
    worksheet = result.scalar_one_or_none()

    if not worksheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiếu học tập"
        )

    if request.title is not None:
        worksheet.title = request.title

    if request.content is not None:
        worksheet.content = request.content
        # Re-parse câu hỏi từ nội dung mới
        worksheet.questions = parse_questions_from_content(request.content)

    await db.commit()
    await db.refresh(worksheet)

    logger.info(f"Updated worksheet {worksheet_id} by user {current_user.id}")

    return {"message": "Đã cập nhật phiếu học tập", "id": worksheet.id}


@router.patch("/{worksheet_id}/toggle-active")
async def toggle_worksheet_active(
    worksheet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bật/tắt trạng thái hoạt động của phiếu"""
    query = select(SharedWorksheet).where(
        SharedWorksheet.id == worksheet_id,
        SharedWorksheet.user_id == current_user.id
    )
    result = await db.execute(query)
    worksheet = result.scalar_one_or_none()
    
    if not worksheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiếu học tập"
        )
    
    worksheet.is_active = not worksheet.is_active
    await db.commit()
    
    status_text = "đã bật" if worksheet.is_active else "đã tắt"
    return {"message": f"Phiếu học tập {status_text}", "is_active": worksheet.is_active}
