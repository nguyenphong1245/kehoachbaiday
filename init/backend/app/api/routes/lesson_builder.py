"""
API Routes cho Lesson Plan Builder - Giao diện mới cho việc soạn kế hoạch bài dạy
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.api.deps import get_current_user, get_db
from app.core.logging import logger
from app.models.user import User
from app.models.saved_lesson_plan import SavedLessonPlan
from app.models.category import Category
from app.models.document import Document
from app.schemas.lesson_plan_builder import (
    LessonSearchRequest,
    LessonSearchResponse,
    LessonDetailResponse,
    GenerateLessonPlanBuilderRequest,
    GenerateLessonPlanBuilderResponse,
    StaticDataResponse,
    TopicsResponse,
    SaveLessonPlanRequest,
    SaveLessonPlanResponse,
    SavedLessonPlanRead,
    SavedLessonPlanListItem,
    SavedLessonPlanListResponse,
    ImproveSectionRequest,
    ImproveSectionResponse,
)
from app.services.lesson_plan_builder_service import get_lesson_plan_builder_service

router = APIRouter()

# Danh sách tên các danh mục cần lấy documents cho việc sinh giáo án
# Lưu ý: Tên phải khớp chính xác với tên trong database
REFERENCE_CATEGORY_NAMES = [
    "Năng lực tin học",
    "Năng lực chung", 
    "Phẩm chất",
    # "Thiết bị",  # Thêm nếu có trong database
]


async def get_reference_documents_from_categories(db: AsyncSession) -> str:
    """
    Lấy tất cả documents từ các danh mục năng lực, phẩm chất, thiết bị...
    để truyền vào prompt cho LLM.
    """
    # Lấy tất cả categories có tên trong danh sách
    categories_result = await db.execute(
        select(Category).where(Category.name.in_(REFERENCE_CATEGORY_NAMES))
    )
    categories = categories_result.scalars().all()
    
    if not categories:
        return ""
    
    category_ids = [cat.id for cat in categories]
    category_name_map = {cat.id: cat.name for cat in categories}
    
    # Lấy tất cả documents thuộc các categories này
    documents_result = await db.execute(
        select(Document).where(Document.category_id.in_(category_ids))
    )
    documents = documents_result.scalars().all()
    
    if not documents:
        return ""
    
    # Nhóm documents theo category
    docs_by_category = {}
    for doc in documents:
        cat_name = category_name_map.get(doc.category_id, "Khác")
        if cat_name not in docs_by_category:
            docs_by_category[cat_name] = []
        docs_by_category[cat_name].append(doc)
    
    # Format thành chuỗi reference documents
    reference_parts = []
    for cat_name in REFERENCE_CATEGORY_NAMES:
        if cat_name in docs_by_category:
            reference_parts.append(f"### {cat_name}\n")
            for doc in docs_by_category[cat_name]:
                if doc.title:
                    reference_parts.append(f"**{doc.title}**\n")
                if doc.content:
                    reference_parts.append(f"{doc.content}\n\n")
    
    return "".join(reference_parts).strip()


@router.get("/static-data", response_model=StaticDataResponse)
async def get_static_data(
    current_user: User = Depends(get_current_user),
) -> StaticDataResponse:
    """
    Lấy dữ liệu tĩnh cho frontend: loại sách, lớp, phương pháp, kỹ thuật
    """
    service = get_lesson_plan_builder_service()
    return service.get_static_data()


@router.get("/topics", response_model=TopicsResponse)
async def get_topics(
    book_type: str,
    grade: str,
    current_user: User = Depends(get_current_user),
) -> TopicsResponse:
    """
    Lấy danh sách chủ đề từ Neo4j theo loại sách và lớp
    """
    service = get_lesson_plan_builder_service()
    return service.get_topics_by_book_and_grade(book_type=book_type, grade=grade)


@router.post("/lessons/search", response_model=LessonSearchResponse)
async def search_lessons(
    request: LessonSearchRequest,
    current_user: User = Depends(get_current_user),
) -> LessonSearchResponse:
    """
    Tìm kiếm bài học từ Neo4j dựa trên loại sách, lớp, chủ đề
    """
    service = get_lesson_plan_builder_service()
    
    try:
        result = service.search_lessons(
            book_type=request.book_type,
            grade=request.grade,
            topic=request.topic
        )
        
        logger.info(
            "lesson_builder.search_lessons book_type=%s grade=%s topic=%s total=%d",
            request.book_type,
            request.grade,
            request.topic,
            result.total
        )
        
        return result
    except Exception as e:
        logger.error(f"Error searching lessons: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tìm kiếm bài học: {str(e)}"
        )


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson_detail(
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
            detail=f"Lỗi lấy chi tiết bài học: {str(e)}"
        )


@router.post("/generate", response_model=GenerateLessonPlanBuilderResponse)
async def generate_lesson_plan(
    request: GenerateLessonPlanBuilderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GenerateLessonPlanBuilderResponse:
    """
    Sinh kế hoạch bài dạy từ thông tin đã chọn.
    Tự động lấy tài liệu tham khảo (năng lực, phẩm chất, thiết bị) từ database.
    """
    service = get_lesson_plan_builder_service()
    
    try:
        # Lấy tất cả documents từ các danh mục năng lực, phẩm chất, thiết bị
        reference_documents = await get_reference_documents_from_categories(db)
        
        # DEBUG: In ra terminal để xem nội dung
        print("\n" + "="*80)
        print("🔍 DEBUG: REFERENCE DOCUMENTS TỪ DATABASE")
        print("="*80)
        if reference_documents:
            print(f"✅ Đã lấy được {len(reference_documents)} ký tự từ các danh mục:")
            # In preview 500 ký tự đầu
            print(reference_documents[:500] + "..." if len(reference_documents) > 500 else reference_documents)
        else:
            print("❌ Không tìm thấy documents nào trong các danh mục: NĂNG LỰC TIN HỌC, NĂNG LỰC CHUNG, PHẨM CHẤT, THIẾT BỊ")
        print("="*80 + "\n")
        
        logger.info(
            "lesson_builder.generate fetched reference_documents length=%d",
            len(reference_documents) if reference_documents else 0
        )
        
        # Sinh kế hoạch bài dạy với tài liệu tham khảo
        response = service.generate_lesson_plan(
            request=request,
            reference_documents=reference_documents if reference_documents else None
        )
        
        logger.info(
            "lesson_builder.generate user_id=%s lesson=%s sections=%d",
            current_user.id,
            request.lesson_name,
            len(response.sections)
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
            detail=f"Lỗi sinh kế hoạch bài dạy: {str(e)}"
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
        sections_data = [s.model_dump() for s in request.sections] if request.sections else None
        
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
            detail=f"Lỗi lưu giáo án: {str(e)}"
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
            search_filter = f"%{search}%"
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
            detail=f"Lỗi lấy danh sách giáo án: {str(e)}"
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
            detail=f"Lỗi lấy giáo án: {str(e)}"
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
            detail=f"Lỗi xóa giáo án: {str(e)}"
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
            detail=f"Lỗi đánh dấu in: {str(e)}"
        )


@router.post("/improve-section", response_model=ImproveSectionResponse)
async def improve_section_with_ai(
    request: ImproveSectionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ImproveSectionResponse:
    """
    Cải thiện nội dung một section với AI dựa trên yêu cầu của người dùng.
    Nếu có phụ lục liên quan, sẽ cập nhật đồng bộ.
    Tự động lấy tài liệu tham khảo (năng lực, phẩm chất, thiết bị) từ database.
    """
    service = get_lesson_plan_builder_service()
    
    try:
        # Lấy tất cả documents từ các danh mục năng lực, phẩm chất, thiết bị
        reference_documents = await get_reference_documents_from_categories(db)
        
        # Chuyển related_appendices thành list dict nếu có
        related_appendices = None
        if request.related_appendices:
            related_appendices = [
                {
                    "section_id": appendix.section_id,
                    "section_type": appendix.section_type,
                    "title": appendix.title,
                    "content": appendix.content
                }
                for appendix in request.related_appendices
            ]
        
        result = service.improve_section(
            section_type=request.section_type,
            section_title=request.section_title,
            current_content=request.current_content,
            user_request=request.user_request,
            lesson_info=request.lesson_info,
            related_appendices=related_appendices,
            reference_documents=reference_documents if reference_documents else None
        )
        
        logger.info(
            "lesson_builder.improve_section user_id=%s section=%s appendices=%s",
            current_user.id,
            request.section_type,
            len(related_appendices) if related_appendices else 0,
        )
        
        return result
    except Exception as e:
        logger.error(f"Error improving section: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cải thiện section: {str(e)}"
        )
