"""
API Routes cho Lesson Plan Builder - Giao diện mới cho việc soạn kế hoạch bài dạy
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from fastapi.responses import StreamingResponse
from typing import Optional
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
import json
import asyncio

from app.api.deps import get_current_user, get_db
from app.core.logging import logger
from app.core.rate_limiter import limiter
from app.services.gemini_limiter import get_gemini_semaphore
from app.models.user import User
from app.models.saved_lesson_plan import SavedLessonPlan
from app.schemas.lesson_plan_builder import (
    LessonSearchRequest,
    LessonSearchResponse,
    LessonDetailResponse,
    GenerateLessonPlanBuilderRequest,
    GenerateLessonPlanBuilderResponse,
    StaticDataResponse,
    TopicsResponse,
    SubjectsResponse,
    SaveLessonPlanRequest,
    SaveLessonPlanResponse,
    SavedLessonPlanRead,
    SavedLessonPlanListItem,
    SavedLessonPlanListResponse,
    ImproveSectionRequest,
    ImproveSectionResponse,
    UpdateLessonPlanRequest,
    GenerateMindmapRequest,
    GenerateMindmapResponse,
    NLSMienNangLucResponse,
    NLSNangLucThanhPhanResponse,
    NLSChiBaoResponse,
)
from app.services.lesson_plan_builder_service import get_lesson_plan_builder_service
from app.services.response_parser import parse_response_to_sections
from app.prompts.lesson_plan_generation import build_teacher_preferences_section
from app.utils.prompt_sanitize import sanitize_prompt_input

router = APIRouter()

# Token tracking constants
_LESSON_PLAN_RESERVE_TOKENS = 5000  # Reserve more tokens for lesson plan generation
_IMPROVE_RESERVE_TOKENS = 1000      # Reserve for section improvement
_MINDMAP_RESERVE_TOKENS = 500       # Reserve for mindmap generation


async def _deduct_tokens(session: AsyncSession, user_id: int, amount: int) -> bool:
    """Deduct tokens from user balance and track usage. Returns True if successful.
    If amount exceeds balance, deduct all remaining balance instead of failing.
    """
    if amount <= 0:
        return True

    # First, try to deduct the full amount
    result = await session.execute(
        update(User)
        .where(User.id == user_id, User.token_balance >= amount)
        .values(
            token_balance=User.token_balance - amount,
            tokens_used=User.tokens_used + amount,
        )
        .returning(User.token_balance)
    )
    row = result.first()
    if row is not None:
        await session.flush()
        logger.info("lesson_builder.token_deducted user_id=%s amount=%s new_balance=%s", user_id, amount, row[0])
        return True

    # Full amount exceeds balance — deduct whatever remains
    result2 = await session.execute(
        select(User.token_balance).where(User.id == user_id)
    )
    current_balance = result2.scalar()
    if current_balance is None or current_balance <= 0:
        return False

    await session.execute(
        update(User)
        .where(User.id == user_id)
        .values(
            token_balance=0,
            tokens_used=User.tokens_used + current_balance,
        )
    )
    await session.flush()
    logger.info(
        "lesson_builder.token_deducted user_id=%s amount=%s (capped from %s) new_balance=0",
        user_id, current_balance, amount,
    )
    return True


async def _check_token_balance(session: AsyncSession, user_id: int, required: int) -> bool:
    """Check if user has enough token balance."""
    result = await session.execute(
        select(User.token_balance).where(User.id == user_id)
    )
    balance = result.scalar()
    return balance is not None and balance >= required


@router.get("/static-data", response_model=StaticDataResponse)
@limiter.limit("30/minute")
async def get_static_data(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> StaticDataResponse:
    """
    Lấy dữ liệu tĩnh cho frontend: loại sách, lớp, phương pháp, kỹ thuật
    """
    service = get_lesson_plan_builder_service()
    return service.get_static_data()


@router.get("/subjects", response_model=SubjectsResponse)
@limiter.limit("30/minute")
async def get_subjects(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> SubjectsResponse:
    """Lấy danh sách môn học từ Neo4j"""
    service = get_lesson_plan_builder_service()
    return SubjectsResponse(subjects=service.get_subjects())


@router.get("/topics", response_model=TopicsResponse)
@limiter.limit("30/minute")
async def get_topics(
    request: Request,
    book_type: str,
    grade: str,
    subject: str = "",
    current_user: User = Depends(get_current_user),
) -> TopicsResponse:
    """
    Lấy danh sách chủ đề từ Neo4j theo loại sách, lớp và môn học
    """
    service = get_lesson_plan_builder_service()
    return service.get_topics_by_book_and_grade(book_type=book_type, grade=grade, subject=subject)


@router.post("/lessons/search", response_model=LessonSearchResponse)
@limiter.limit("30/minute")
async def search_lessons(
    request: Request,
    payload: LessonSearchRequest,
    current_user: User = Depends(get_current_user),
) -> LessonSearchResponse:
    """
    Tìm kiếm bài học từ Neo4j dựa trên loại sách, lớp, chủ đề
    """
    service = get_lesson_plan_builder_service()
    
    try:
        result = service.search_lessons(
            book_type=payload.book_type,
            grade=payload.grade,
            topic=payload.topic,
            subject=getattr(payload, "subject", ""),
        )

        logger.info(
            "lesson_builder.search_lessons book_type=%s grade=%s topic=%s total=%d",
            payload.book_type,
            payload.grade,
            payload.topic,
            result.total
        )
        
        return result
    except Exception as e:
        logger.error(f"Error searching lessons: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi tìm kiếm bài học"
        )


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
@limiter.limit("30/minute")
async def get_lesson_detail(
    request: Request,
    lesson_id: str,
    current_user: User = Depends(get_current_user),
) -> LessonDetailResponse:
    """
    Lấy chi tiết bài học bao gồm danh sách chỉ mục
    """
    service = get_lesson_plan_builder_service()
    
    try:
        result = service.get_lesson_detail(lesson_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy bài học với ID: {lesson_id}"
            )
        
        logger.info(
            "lesson_builder.get_lesson_detail lesson_id=%s name=%s",
            lesson_id,
            result.name
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting lesson detail: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi lấy chi tiết bài học"
        )


@router.post("/generate", response_model=GenerateLessonPlanBuilderResponse)
@limiter.limit("5/minute")
async def generate_lesson_plan(
    request: Request,
    payload: GenerateLessonPlanBuilderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GenerateLessonPlanBuilderResponse:
    """
    Sinh kế hoạch bài dạy từ thông tin đã chọn.
    Tự động lấy tài liệu tham khảo (năng lực, phẩm chất) từ Neo4j.
    """
    # Check token balance before starting
    if not await _check_token_balance(db, current_user.id, _LESSON_PLAN_RESERVE_TOKENS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.",
        )

    service = get_lesson_plan_builder_service()

    try:
        loop = asyncio.get_event_loop()
        reference_documents = await loop.run_in_executor(
            None, service.get_reference_documents_from_neo4j
        )

        # Build teacher preferences section from user settings
        teacher_prefs = ""
        if current_user.settings:
            tools = current_user.settings.teaching_tools
            style = current_user.settings.teaching_style
            safe_style = sanitize_prompt_input(style, max_length=2000) if style else None
            teacher_prefs = build_teacher_preferences_section(tools, safe_style)

        logger.info(
            "lesson_builder.generate starting for lesson=%s",
            payload.lesson_name
        )

        async with get_gemini_semaphore():
            response, tokens_used = await loop.run_in_executor(
                None, service.generate_lesson_plan, payload, reference_documents, teacher_prefs
            )

        # Deduct actual tokens used
        if tokens_used > 0:
            await _deduct_tokens(db, current_user.id, tokens_used)
            await db.commit()

        logger.info(
            "lesson_builder.generate user_id=%s lesson=%s sections=%d tokens=%d",
            current_user.id,
            payload.lesson_name,
            len(response.sections),
            tokens_used
        )

        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating lesson plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi sinh kế hoạch bài dạy"
        )



@router.post("/generate-stream")
@limiter.limit("5/minute")
async def generate_lesson_plan_stream(
    request: Request,
    payload: GenerateLessonPlanBuilderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sinh kế hoạch bài dạy với SSE progress streaming.
    Gửi các event: progress (tiến trình) và result (kết quả cuối).
    """
    # Check token balance before starting stream
    if not await _check_token_balance(db, current_user.id, _LESSON_PLAN_RESERVE_TOKENS):
        async def error_generator():
            yield f"data: {json.dumps({'type': 'error', 'message': 'Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.'}, ensure_ascii=False)}\n\n"
        return StreamingResponse(
            error_generator(),
            media_type="text/event-stream",
        )

    service = get_lesson_plan_builder_service()
    user_id = current_user.id  # Capture user_id for use in generator

    async def event_generator():
        loop = asyncio.get_event_loop()
        total_tokens_used = 0  # Track tokens across all AI calls

        try:
            # Detect mindmap activities to determine total steps
            mindmap_activities = [
                a for a in payload.activities
                if "Sơ đồ tư duy" in (a.selected_techniques or [])
            ]
            base_steps = 5  # ref docs, lesson detail, prompt, AI generate, parse
            if mindmap_activities:
                base_steps += 1
            total_steps = base_steps
            current_step = 0

            # Step 1: Lấy tài liệu tham khảo
            current_step += 1
            yield f"data: {json.dumps({'type': 'progress', 'step': current_step, 'total_steps': total_steps, 'message': 'Đang lấy tài liệu tham khảo...'}, ensure_ascii=False)}\n\n"

            try:
                reference_documents = await asyncio.wait_for(
                    loop.run_in_executor(None, service.get_reference_documents_from_neo4j),
                    timeout=60,
                )
            except asyncio.TimeoutError:
                logger.error("Neo4j get_reference_documents timed out after 60s")
                yield f"data: {json.dumps({'type': 'error', 'message': 'Không thể kết nối cơ sở dữ liệu tham khảo (timeout). Vui lòng thử lại.'}, ensure_ascii=False)}\n\n"
                return

            # Step 2: Lấy chi tiết bài học
            current_step += 1
            yield f"data: {json.dumps({'type': 'progress', 'step': current_step, 'total_steps': total_steps, 'message': 'Đang lấy nội dung bài học...'}, ensure_ascii=False)}\n\n"

            try:
                lesson_detail = await asyncio.wait_for(
                    loop.run_in_executor(None, service.get_lesson_detail, payload.lesson_id),
                    timeout=60,
                )
            except asyncio.TimeoutError:
                logger.error("Neo4j get_lesson_detail timed out after 60s for lesson_id=%s", payload.lesson_id)
                yield f"data: {json.dumps({'type': 'error', 'message': 'Không thể lấy nội dung bài học (timeout). Vui lòng thử lại.'}, ensure_ascii=False)}\n\n"
                return
            if not lesson_detail:
                yield f"data: {json.dumps({'type': 'error', 'message': f'Không tìm thấy bài học với ID: {payload.lesson_id}'}, ensure_ascii=False)}\n\n"
                return

            # Build teacher preferences section from user settings
            teacher_prefs = ""
            if current_user.settings:
                tools = current_user.settings.teaching_tools
                style = current_user.settings.teaching_style
                safe_style = sanitize_prompt_input(style, max_length=2000) if style else None
                teacher_prefs = build_teacher_preferences_section(tools, safe_style)

            # Step N: Xây dựng prompt
            current_step += 1
            yield f"data: {json.dumps({'type': 'progress', 'step': current_step, 'total_steps': total_steps, 'message': 'Đang xây dựng prompt...'}, ensure_ascii=False)}\n\n"

            prompt = service._build_prompt(payload, lesson_detail, reference_documents, lesson_detail.content, teacher_prefs)

            # Step N+1: Gọi AI sinh nội dung (giới hạn concurrent qua semaphore)
            current_step += 1
            yield f"data: {json.dumps({'type': 'progress', 'step': current_step, 'total_steps': total_steps, 'message': 'AI đang sinh kế hoạch bài dạy...'}, ensure_ascii=False)}\n\n"

            try:
                async with get_gemini_semaphore():
                    response = await asyncio.wait_for(
                        loop.run_in_executor(None, service.model.generate_content, prompt),
                        timeout=300,
                    )
            except asyncio.TimeoutError:
                logger.error("Gemini generate_content timed out after 300s")
                yield f"data: {json.dumps({'type': 'error', 'message': 'AI xử lý quá lâu (timeout 5 phút). Vui lòng thử lại.'}, ensure_ascii=False)}\n\n"
                return

            # Track token usage from main generation
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                tokens = getattr(response.usage_metadata, 'total_token_count', 0)
                total_tokens_used += tokens
                logger.info("Stream: main generation tokens=%d", tokens)

            raw_response = (response.text or "").strip()

            if not raw_response:
                yield f"data: {json.dumps({'type': 'error', 'message': 'AI trả về kết quả rỗng'}, ensure_ascii=False)}\n\n"
                return

            # Step N+2: Phân tích kết quả
            current_step += 1
            yield f"data: {json.dumps({'type': 'progress', 'step': current_step, 'total_steps': total_steps, 'message': 'Đang phân tích và xử lý kết quả...'}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0)

            sections = parse_response_to_sections(raw_response)

            # Validate and retry missing sections (same logic as generate_lesson_plan)
            required_sections = ['muc_tieu', 'thiet_bi', 'khoi_dong', 'hinh_thanh_kien_thuc', 'luyen_tap', 'van_dung']
            parsed_types = [s.section_type for s in sections]
            missing_sections = [s for s in required_sections if s not in parsed_types]

            if missing_sections:
                section_titles = {
                    'muc_tieu': 'Mục tiêu bài học',
                    'thiet_bi': 'Thiết bị dạy học',
                    'khoi_dong': 'Hoạt động 1: Khởi động',
                    'hinh_thanh_kien_thuc': 'Hoạt động 2: Hình thành kiến thức mới',
                    'luyen_tap': 'Hoạt động 3: Luyện tập',
                    'van_dung': 'Hoạt động 4: Vận dụng'
                }
                try:
                    retry_fn = lambda: service._retry_missing_sections(missing_sections, section_titles, payload, sections)
                    async with get_gemini_semaphore():
                        retry_sections, retry_tokens = await asyncio.wait_for(
                            loop.run_in_executor(None, retry_fn),
                            timeout=120,
                        )
                    sections.extend(retry_sections)
                    total_tokens_used += retry_tokens
                    logger.info("Stream: retry tokens=%d", retry_tokens)
                except Exception as e:
                    logger.warning("Failed to retry missing sections: %s", e)

                parsed_types_after = [s.section_type for s in sections]
                still_missing = [s for s in required_sections if s not in parsed_types_after]
                if still_missing:
                    from app.schemas.lesson_plan_builder import LessonPlanSection
                    for missing in still_missing:
                        sections.append(LessonPlanSection(
                            section_id=missing,
                            section_type=missing,
                            title=section_titles.get(missing, missing),
                            content=f"\u26a0\ufe0f **Lỗi:** Section này không được sinh ra. Vui lòng thử lại.",
                            editable=True
                        ))

                order = ['muc_tieu', 'thiet_bi', 'khoi_dong', 'hinh_thanh_kien_thuc', 'luyen_tap', 'van_dung', 'phieu_hoc_tap', 'trac_nghiem']
                sections.sort(key=lambda s: order.index(s.section_type) if s.section_type in order else 999)

            # Step (conditional): Generate mindmap (AI 2) for activities using "Sơ đồ tư duy"
            if mindmap_activities:
                current_step += 1
                yield f"data: {json.dumps({'type': 'progress', 'step': current_step, 'total_steps': total_steps, 'message': 'Đang tạo sơ đồ tư duy...'}, ensure_ascii=False)}\n\n"

                for activity in mindmap_activities:
                    # Find section matching this activity's type
                    target_section = None
                    for s in sections:
                        if s.section_type.startswith(activity.activity_type):
                            target_section = s
                            break

                    if target_section:
                        try:
                            async with get_gemini_semaphore():
                                mindmap_md, mindmap_tokens = await asyncio.wait_for(
                                    loop.run_in_executor(
                                        None,
                                        lambda: service.generate_mindmap(
                                            lesson_name=payload.lesson_name,
                                            lesson_id=payload.lesson_id,
                                            activity_content=target_section.content,
                                            activity_name=activity.activity_name,
                                            activity_type=activity.activity_type,
                                            chi_muc=activity.chi_muc,
                                            lesson_detail=lesson_detail,
                                        )
                                    ),
                                    timeout=60,
                                )
                            target_section.mindmap_data = mindmap_md
                            target_section.mindmap_activity_name = activity.activity_name
                            total_tokens_used += mindmap_tokens
                            logger.info("Mindmap attached to section '%s' for activity '%s', tokens=%d", target_section.section_type, activity.activity_name, mindmap_tokens)
                        except Exception as e:
                            logger.warning("Mindmap generation failed for '%s': %s", activity.activity_name, e)

            # Build response
            result = GenerateLessonPlanBuilderResponse(
                lesson_info={
                    "book_type": payload.book_type,
                    "grade": payload.grade,
                    "topic": payload.topic,
                    "lesson_name": payload.lesson_name,
                    "lesson_id": payload.lesson_id,
                },
                sections=sections,
                full_content=raw_response
            )

            # Send final result with token info
            result_data = result.model_dump(mode='json')
            result_data['tokens_used'] = total_tokens_used
            yield f"data: {json.dumps({'type': 'result', 'data': result_data}, ensure_ascii=False)}\n\n"

            # Deduct tokens after sending result
            if total_tokens_used > 0:
                try:
                    await _deduct_tokens(db, user_id, total_tokens_used)
                    await db.commit()
                except Exception as token_err:
                    logger.error("Failed to deduct tokens: %s", token_err)

            logger.info(
                "lesson_builder.generate_stream user_id=%s lesson=%s sections=%d tokens=%d",
                user_id,
                payload.lesson_name,
                len(result.sections),
                total_tokens_used
            )

        except Exception as e:
            logger.error("Error in generate_stream: %s", e, exc_info=True)
            err_msg = str(e)
            if "quota" in err_msg.lower() or "rate" in err_msg.lower():
                user_msg = "Đã vượt giới hạn API. Vui lòng thử lại sau vài phút."
            elif "api key" in err_msg.lower() or "authentication" in err_msg.lower():
                user_msg = "Lỗi xác thực API AI. Vui lòng liên hệ quản trị viên."
            else:
                user_msg = f"Lỗi sinh kế hoạch bài dạy: {err_msg[:200]}"
            yield f"data: {json.dumps({'type': 'error', 'message': user_msg}, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
        }
    )


# ============== MINDMAP GENERATION ENDPOINT ==============

@router.post("/generate-mindmap", response_model=GenerateMindmapResponse)
@limiter.limit("10/minute")
async def generate_mindmap_endpoint(
    request: Request,
    payload: GenerateMindmapRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sinh sơ đồ tư duy (markdown headings) cho một hoạt động.
    Dùng cho nút toolbar "Sơ đồ tư duy" trên frontend.
    """
    # Check token balance
    if not await _check_token_balance(db, current_user.id, _MINDMAP_RESERVE_TOKENS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.",
        )

    service = get_lesson_plan_builder_service()
    loop = asyncio.get_event_loop()

    try:
        async with get_gemini_semaphore():
            mindmap_data, tokens_used = await loop.run_in_executor(
                None,
                lambda: service.generate_mindmap(
                    lesson_name=payload.lesson_name,
                    lesson_id=payload.lesson_id,
                    activity_content=payload.activity_content,
                    activity_name=payload.activity_name,
                    activity_type=payload.activity_type,
                    chi_muc=payload.chi_muc,
                )
            )

        # Deduct tokens
        if tokens_used > 0:
            await _deduct_tokens(db, current_user.id, tokens_used)
            await db.commit()

        logger.info("lesson_builder.mindmap user_id=%s tokens=%d", current_user.id, tokens_used)
        return GenerateMindmapResponse(mindmap_data=mindmap_data)
    except Exception as e:
        logger.error("Mindmap generation error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi sinh sơ đồ tư duy: {str(e)}"
        )


# ============== SAVED LESSON PLAN ENDPOINTS ==============

@router.post("/saved", response_model=SaveLessonPlanResponse)
async def save_lesson_plan(
    request: SaveLessonPlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SaveLessonPlanResponse:
    """
    Lưu giáo án sau khi người dùng chỉnh sửa hoặc khi in
    """
    try:
        # Extract lesson info
        lesson_info = request.lesson_info
        
        # Prepare sections as JSON
        sections_data = None
        if request.sections:
            sections_data = [s.model_dump() for s in request.sections]
        
        # Prepare generation params (activities config)
        generation_params = None
        if request.activities:
            generation_params = [a.model_dump() for a in request.activities]
        
        # Create saved lesson plan
        saved_plan = SavedLessonPlan(
            user_id=current_user.id,
            title=request.title,
            book_type=lesson_info.get("book_type"),
            grade=lesson_info.get("grade"),
            topic=lesson_info.get("topic"),
            lesson_name=lesson_info.get("lesson_name"),
            lesson_id=lesson_info.get("lesson_id"),
            content=request.full_content,
            sections=sections_data,
            generation_params=generation_params,
            original_content=request.original_content,
            is_printed=request.is_printed,
            print_count=1 if request.is_printed else 0,
        )
        
        db.add(saved_plan)
        await db.commit()
        await db.refresh(saved_plan)
        
        logger.info(
            "lesson_builder.save user_id=%s lesson=%s id=%d is_printed=%s",
            current_user.id,
            request.title,
            saved_plan.id,
            request.is_printed,
        )
        
        return SaveLessonPlanResponse(
            id=saved_plan.id,
            message="Lưu giáo án thành công"
        )
    except Exception as e:
        logger.error(f"Error saving lesson plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi lưu giáo án"
        )


@router.get("/saved", response_model=SavedLessonPlanListResponse)
async def get_saved_lesson_plans(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavedLessonPlanListResponse:
    """
    Lấy danh sách giáo án đã lưu của người dùng
    """
    try:
        # Base query
        query = select(SavedLessonPlan).where(SavedLessonPlan.user_id == current_user.id)
        count_query = select(func.count(SavedLessonPlan.id)).where(SavedLessonPlan.user_id == current_user.id)
        
        # Search filter
        if search:
            safe_search = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            search_filter = f"%{safe_search}%"
            query = query.where(
                (SavedLessonPlan.title.ilike(search_filter)) |
                (SavedLessonPlan.lesson_name.ilike(search_filter)) |
                (SavedLessonPlan.topic.ilike(search_filter))
            )
            count_query = count_query.where(
                (SavedLessonPlan.title.ilike(search_filter)) |
                (SavedLessonPlan.lesson_name.ilike(search_filter)) |
                (SavedLessonPlan.topic.ilike(search_filter))
            )
        
        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.order_by(SavedLessonPlan.updated_at.desc()).offset(offset).limit(page_size)
        
        result = await db.execute(query)
        plans = result.scalars().all()
        
        # Convert to response
        lesson_plans = [
            SavedLessonPlanListItem(
                id=plan.id,
                title=plan.title,
                lesson_name=plan.lesson_name,
                book_type=plan.book_type,
                grade=plan.grade,
                topic=plan.topic,
                is_printed=plan.is_printed,
                print_count=plan.print_count or 0,
                created_at=plan.created_at.isoformat() if plan.created_at else "",
                updated_at=plan.updated_at.isoformat() if plan.updated_at else "",
            )
            for plan in plans
        ]
        
        logger.info(
            "lesson_builder.get_saved_list user_id=%s total=%d page=%d",
            current_user.id,
            total,
            page,
        )
        
        return SavedLessonPlanListResponse(
            lesson_plans=lesson_plans,
            total=total,
            page=page,
            page_size=page_size,
        )
    except Exception as e:
        logger.error(f"Error getting saved lesson plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi lấy danh sách giáo án"
        )


@router.get("/saved/{lesson_plan_id}", response_model=SavedLessonPlanRead)
async def get_saved_lesson_plan(
    lesson_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SavedLessonPlanRead:
    """
    Lấy chi tiết một giáo án đã lưu
    """
    try:
        result = await db.execute(
            select(SavedLessonPlan).where(
                SavedLessonPlan.id == lesson_plan_id,
                SavedLessonPlan.user_id == current_user.id
            )
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy giáo án với ID: {lesson_plan_id}"
            )
        
        logger.info(
            "lesson_builder.get_saved user_id=%s lesson_plan_id=%d",
            current_user.id,
            lesson_plan_id,
        )
        
        return SavedLessonPlanRead(
            id=plan.id,
            user_id=plan.user_id,
            title=plan.title,
            book_type=plan.book_type,
            grade=plan.grade,
            topic=plan.topic,
            lesson_name=plan.lesson_name,
            lesson_id=plan.lesson_id,
            content=plan.content,
            sections=plan.sections,
            generation_params=plan.generation_params,
            original_content=plan.original_content,
            is_printed=plan.is_printed,
            print_count=plan.print_count or 0,
            created_at=plan.created_at.isoformat() if plan.created_at else "",
            updated_at=plan.updated_at.isoformat() if plan.updated_at else "",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting saved lesson plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi lấy giáo án"
        )


@router.put("/saved/{lesson_plan_id}", response_model=SavedLessonPlanRead)
async def update_saved_lesson_plan(
    lesson_plan_id: int,
    request: UpdateLessonPlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cập nhật một giáo án đã lưu
    """
    try:
        result = await db.execute(
            select(SavedLessonPlan).where(
                SavedLessonPlan.id == lesson_plan_id,
                SavedLessonPlan.user_id == current_user.id
            )
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy giáo án với ID: {lesson_plan_id}"
            )
        
        # Cập nhật các trường được gửi
        if request.title is not None:
            plan.title = request.title
        if request.sections is not None:
            plan.sections = [s.model_dump() for s in request.sections]
        if request.full_content is not None:
            plan.content = request.full_content
        
        await db.commit()
        await db.refresh(plan)
        
        logger.info(
            "lesson_builder.update user_id=%s lesson_plan_id=%d",
            current_user.id,
            lesson_plan_id,
        )
        
        return SavedLessonPlanRead(
            id=plan.id,
            user_id=plan.user_id,
            title=plan.title,
            book_type=plan.book_type,
            grade=plan.grade,
            topic=plan.topic,
            lesson_name=plan.lesson_name,
            lesson_id=plan.lesson_id,
            content=plan.content,
            sections=plan.sections,
            generation_params=plan.generation_params,
            original_content=plan.original_content,
            is_printed=plan.is_printed,
            print_count=plan.print_count or 0,
            created_at=plan.created_at.isoformat() if plan.created_at else "",
            updated_at=plan.updated_at.isoformat() if plan.updated_at else "",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating saved lesson plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cập nhật giáo án"
        )


@router.delete("/saved/{lesson_plan_id}")
async def delete_saved_lesson_plan(
    lesson_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Xóa một giáo án đã lưu
    """
    try:
        result = await db.execute(
            select(SavedLessonPlan).where(
                SavedLessonPlan.id == lesson_plan_id,
                SavedLessonPlan.user_id == current_user.id
            )
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy giáo án với ID: {lesson_plan_id}"
            )
        
        await db.delete(plan)
        await db.commit()
        
        logger.info(
            "lesson_builder.delete user_id=%s lesson_plan_id=%d",
            current_user.id,
            lesson_plan_id,
        )
        
        return {"message": "Xóa giáo án thành công"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting lesson plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi xóa giáo án"
        )


@router.patch("/saved/{lesson_plan_id}/print")
async def mark_lesson_plan_printed(
    lesson_plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Đánh dấu giáo án đã được in (tăng print_count)
    """
    try:
        result = await db.execute(
            select(SavedLessonPlan).where(
                SavedLessonPlan.id == lesson_plan_id,
                SavedLessonPlan.user_id == current_user.id
            )
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy giáo án với ID: {lesson_plan_id}"
            )
        
        plan.is_printed = True
        plan.print_count = (plan.print_count or 0) + 1
        await db.commit()
        
        logger.info(
            "lesson_builder.print user_id=%s lesson_plan_id=%d print_count=%d",
            current_user.id,
            lesson_plan_id,
            plan.print_count,
        )
        
        return {"message": "Đã đánh dấu in giáo án", "print_count": plan.print_count}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking lesson plan printed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi đánh dấu in"
        )


@router.post("/improve-section", response_model=ImproveSectionResponse)
@limiter.limit("10/minute")
async def improve_section_with_ai(
    request: Request,
    payload: ImproveSectionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ImproveSectionResponse:
    """
    Cải thiện nội dung một section với AI dựa trên yêu cầu của người dùng.
    Nếu có phụ lục liên quan, sẽ cập nhật đồng bộ.
    Tự động lấy tài liệu tham khảo (năng lực, phẩm chất) từ Neo4j.
    """
    # Check token balance
    if not await _check_token_balance(db, current_user.id, _IMPROVE_RESERVE_TOKENS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.",
        )

    service = get_lesson_plan_builder_service()

    try:
        loop = asyncio.get_event_loop()
        reference_documents = await loop.run_in_executor(
            None, service.get_reference_documents_from_neo4j
        )

        related_appendices = None
        if payload.related_appendices:
            related_appendices = [
                {
                    "section_id": appendix.section_id,
                    "section_type": appendix.section_type,
                    "title": appendix.title,
                    "content": appendix.content
                }
                for appendix in payload.related_appendices
            ]

        def _do_improve():
            return service.improve_section(
                section_type=payload.section_type,
                section_title=payload.section_title,
                current_content=payload.current_content,
                user_request=payload.user_request,
                lesson_info=payload.lesson_info,
                related_appendices=related_appendices,
                reference_documents=reference_documents if reference_documents else None
            )

        async with get_gemini_semaphore():
            result, tokens_used = await loop.run_in_executor(None, _do_improve)

        # Deduct tokens
        if tokens_used > 0:
            await _deduct_tokens(db, current_user.id, tokens_used)
            await db.commit()

        logger.info(
            "lesson_builder.improve_section user_id=%s section=%s appendices=%s tokens=%d",
            current_user.id,
            payload.section_type,
            len(related_appendices) if related_appendices else 0,
            tokens_used
        )

        return result
    except Exception as e:
        logger.error(f"Error improving section: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cải thiện section"
        )


# ============== NLS (Năng lực số) ENDPOINTS ==============

@router.get("/nls/mien-nang-luc", response_model=NLSMienNangLucResponse)
@limiter.limit("30/minute")
async def get_nls_mien_nang_luc(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> NLSMienNangLucResponse:
    """
    Lấy danh sách Miền năng lực từ Neo4j
    """
    service = get_lesson_plan_builder_service()
    try:
        result = service.get_nls_mien_nang_luc()
        logger.info("nls.get_mien_nang_luc user_id=%s total=%d", current_user.id, len(result.mien_nang_luc))
        return result
    except Exception as e:
        logger.error(f"Error getting NLS mien nang luc: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi lấy danh sách miền năng lực"
        )


@router.get("/nls/nang-luc-thanh-phan", response_model=NLSNangLucThanhPhanResponse)
@limiter.limit("30/minute")
async def get_nls_nang_luc_thanh_phan(
    request: Request,
    mien_nang_luc: str = Query(..., description="Tên miền năng lực"),
    current_user: User = Depends(get_current_user),
) -> NLSNangLucThanhPhanResponse:
    """
    Lấy danh sách Năng lực thành phần theo Miền năng lực từ Neo4j
    """
    service = get_lesson_plan_builder_service()
    try:
        result = service.get_nls_nang_luc_thanh_phan(mien_nang_luc)
        logger.info(
            "nls.get_nang_luc_thanh_phan user_id=%s mien=%s total=%d",
            current_user.id, mien_nang_luc, len(result.nang_luc_thanh_phan)
        )
        return result
    except Exception as e:
        logger.error(f"Error getting NLS nang luc thanh phan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi lấy danh sách năng lực thành phần"
        )


@router.get("/nls/chi-bao", response_model=NLSChiBaoResponse)
@limiter.limit("30/minute")
async def get_nls_chi_bao(
    request: Request,
    nang_luc_thanh_phan: str = Query(..., description="Tên năng lực thành phần"),
    current_user: User = Depends(get_current_user),
) -> NLSChiBaoResponse:
    """
    Lấy danh sách Chỉ báo theo Năng lực thành phần từ Neo4j
    """
    service = get_lesson_plan_builder_service()
    try:
        result = service.get_nls_chi_bao(nang_luc_thanh_phan)
        logger.info(
            "nls.get_chi_bao user_id=%s nangluc=%s total=%d",
            current_user.id, nang_luc_thanh_phan, len(result.chi_bao)
        )
        return result
    except Exception as e:
        logger.error(f"Error getting NLS chi bao: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi lấy danh sách chỉ báo"
        )
