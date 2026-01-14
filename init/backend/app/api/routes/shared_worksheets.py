"""
API Routes cho Phiếu học tập chia sẻ
"""
import secrets
import re
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.shared_worksheet import SharedWorksheet, WorksheetResponse
from app.schemas.shared_worksheet import (
    CreateSharedWorksheetRequest,
    CreateSharedWorksheetResponse,
    SharedWorksheetResponse,
    SharedWorksheetListResponse,
    WorksheetPublicResponse,
    SubmitWorksheetRequest,
    SubmitWorksheetResponse,
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
    
    await db.delete(worksheet)
    await db.commit()
    
    return {"message": "Đã xóa phiếu học tập"}


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


# ============== PUBLIC ENDPOINTS (Học sinh) ==============

@router.get("/public/{share_code}", response_model=WorksheetPublicResponse)
async def get_public_worksheet(
    share_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Lấy phiếu học tập theo mã chia sẻ (public, không cần đăng nhập)"""
    logger.info(f"[PUBLIC] Requesting worksheet with share_code: {share_code}")
    
    query = select(SharedWorksheet).options(
        selectinload(SharedWorksheet.user)
    ).where(SharedWorksheet.share_code == share_code)
    
    result = await db.execute(query)
    worksheet = result.scalar_one_or_none()
    
    if not worksheet:
        logger.warning(f"[PUBLIC] Worksheet not found for share_code: {share_code}")
        # Kiểm tra xem có worksheet nào trong DB không
        count_query = select(func.count(SharedWorksheet.id))
        count_result = await db.execute(count_query)
        total_worksheets = count_result.scalar() or 0
        logger.info(f"[PUBLIC] Total worksheets in DB: {total_worksheets}")
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiếu học tập"
        )
    
    logger.info(f"[PUBLIC] Found worksheet: id={worksheet.id}, title={worksheet.title}")
    
    # Kiểm tra hết hạn
    if worksheet.expires_at and worksheet.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Phiếu học tập đã hết hạn"
        )
    
    # Kiểm tra số lượt submit
    if worksheet.max_submissions:
        count_query = select(func.count(WorksheetResponse.id)).where(
            WorksheetResponse.worksheet_id == worksheet.id
        )
        count_result = await db.execute(count_query)
        current_count = count_result.scalar() or 0
        if current_count >= worksheet.max_submissions:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Phiếu học tập đã đạt số lượt nộp tối đa"
            )
    
    if not worksheet.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Phiếu học tập đã bị tắt"
        )
    
    # Lấy tên giáo viên (dùng email thay vì username)
    teacher_name = None
    if worksheet.user:
        teacher_name = worksheet.user.email.split('@')[0]  # Lấy phần trước @ làm tên
    
    return WorksheetPublicResponse(
        title=worksheet.title,
        content=worksheet.content,
        lesson_info=worksheet.lesson_info,
        questions=worksheet.questions,
        is_active=worksheet.is_active,
        teacher_name=teacher_name,
    )


# ❌ KHÔNG dùng /{share_code} trực tiếp vì sẽ conflict với các routes khác
# Frontend phải gọi /public/{share_code}


@router.post("/public/{share_code}/submit", response_model=SubmitWorksheetResponse)
async def submit_worksheet(
    share_code: str,
    request: SubmitWorksheetRequest,
    req: Request,
    db: AsyncSession = Depends(get_db),
):
    """Học sinh nộp phiếu học tập (public, không cần đăng nhập)"""
    query = select(SharedWorksheet).where(SharedWorksheet.share_code == share_code)
    result = await db.execute(query)
    worksheet = result.scalar_one_or_none()
    
    if not worksheet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiếu học tập"
        )
    
    # Kiểm tra các điều kiện
    if not worksheet.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Phiếu học tập đã bị tắt"
        )
    
    if worksheet.expires_at and worksheet.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Phiếu học tập đã hết hạn"
        )
    
    if worksheet.max_submissions:
        count_query = select(func.count(WorksheetResponse.id)).where(
            WorksheetResponse.worksheet_id == worksheet.id
        )
        count_result = await db.execute(count_query)
        current_count = count_result.scalar() or 0
        if current_count >= worksheet.max_submissions:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Phiếu học tập đã đạt số lượt nộp tối đa"
            )
    
    # Lấy IP
    client_ip = req.client.host if req.client else None
    
    # Lưu câu trả lời
    response = WorksheetResponse(
        worksheet_id=worksheet.id,
        student_name=request.student_name,
        student_class=request.student_class,
        answers=request.answers,
        ip_address=client_ip,
    )
    
    db.add(response)
    await db.commit()
    
    logger.info(f"Student {request.student_name} submitted worksheet {worksheet.id}")
    
    return SubmitWorksheetResponse(
        success=True,
        message="Đã nộp phiếu học tập thành công! Cảm ơn em đã hoàn thành."
    )
