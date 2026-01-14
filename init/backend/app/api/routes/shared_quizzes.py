"""
API Routes cho Quiz chia sẻ (Trắc nghiệm)
"""
import secrets
import re
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.shared_quiz import SharedQuiz, QuizResponse
from app.schemas.shared_quiz import (
    CreateSharedQuizRequest,
    CreateSharedQuizResponse,
    SharedQuizResponse,
    QuizPublicResponse,
    QuizQuestion,
    SubmitQuizRequest,
    SubmitQuizResponse,
    QuizResponseItem,
    QuizResponsesListResponse,
)
from app.core.config import get_settings

router = APIRouter(prefix="/quizzes", tags=["Shared Quizzes"])
logger = logging.getLogger(__name__)


def generate_share_code() -> str:
    """Tạo mã chia sẻ ngẫu nhiên 8 ký tự"""
    return secrets.token_urlsafe(6)[:8]


def parse_quiz_questions(content: str) -> list[QuizQuestion]:
    """
    Parse nội dung trắc nghiệm thành danh sách câu hỏi
    Hỗ trợ nhiều format bao gồm cả đáp án trên cùng 1 dòng
    """
    questions = []
    
    logger.info(f"Parsing quiz content, length: {len(content)}")
    
    # Loại bỏ markdown bold markers
    clean_content = content.replace('**', '').replace('*', '')
    
    # Pattern tìm câu hỏi - từ "Câu X:" đến trước "Câu Y:" hoặc hết chuỗi
    pattern = r'Câu\s*(\d+)[:\.]?\s*(.+?)(?=Câu\s*\d+[:\.]?|$)'
    matches = re.findall(pattern, clean_content, re.DOTALL | re.IGNORECASE)
    
    logger.info(f"Found {len(matches)} potential questions")
    
    for idx, (num, question_block) in enumerate(matches):
        question_block = question_block.strip()
        
        # Tách câu hỏi khỏi các đáp án
        # Tìm vị trí bắt đầu của đáp án A
        a_match = re.search(r'\n?\s*A[\.)\s]', question_block)
        if a_match:
            question_text = question_block[:a_match.start()].strip()
            answers_part = question_block[a_match.start():].strip()
        else:
            # Thử tìm trên cùng dòng
            inline_match = re.search(r'\s+A[\.)\s]', question_block)
            if inline_match:
                question_text = question_block[:inline_match.start()].strip()
                answers_part = question_block[inline_match.start():].strip()
            else:
                question_text = question_block.split('\n')[0].strip()
                answers_part = '\n'.join(question_block.split('\n')[1:])
        
        options = {}
        correct_answer = None
        
        # Parse các đáp án - hỗ trợ cả xuống dòng và cùng dòng
        # Format: A. xxx B. xxx hoặc A. xxx\nB. xxx
        option_pattern = r'([A-D])[\.)\s]+([^A-D]+?)(?=[A-D][\.)\s]|Đáp án|$)'
        option_matches = re.findall(option_pattern, answers_part, re.IGNORECASE | re.DOTALL)
        
        for key, value in option_matches:
            key = key.upper()
            value = value.strip()
            
            # Kiểm tra đáp án đúng (← hoặc "Đáp án đúng")
            if '←' in value or '<-' in value or 'đáp án đúng' in value.lower():
                correct_answer = key
                # Loại bỏ marker
                value = re.sub(r'\s*[←<-]+\s*Đáp án đúng\s*', '', value, flags=re.IGNORECASE)
                value = re.sub(r'\s*[←<-]+.*$', '', value).strip()
            
            # Loại bỏ newlines và whitespace thừa
            value = ' '.join(value.split())
            if value:
                options[key] = value
        
        # Tìm đáp án từ dòng riêng: "Đáp án: A" hoặc "*Đáp án: A*"
        if not correct_answer:
            answer_match = re.search(r'Đáp\s*án[:\s]+([A-D])', answers_part, re.IGNORECASE)
            if answer_match:
                correct_answer = answer_match.group(1).upper()
        
        # Thêm câu hỏi nếu đủ thông tin
        if question_text and len(options) >= 2 and correct_answer:
            questions.append(QuizQuestion(
                id=f"question_{idx + 1}",
                question=question_text,
                options=options,
                correct_answer=correct_answer
            ))
            logger.info(f"✓ Question {idx + 1}: '{question_text[:50]}...', {len(options)} options, answer={correct_answer}")
        else:
            logger.warning(f"⚠️ Skipped question {num}: text={bool(question_text)}, options={len(options)}, answer={correct_answer}")
    
    return questions


def convert_questions_input_to_quiz(questions_input: list) -> list[QuizQuestion]:
    """Chuyển đổi questions array từ LLM JSON sang QuizQuestion"""
    questions = []
    for idx, q in enumerate(questions_input):
        questions.append(QuizQuestion(
            id=f"question_{idx + 1}",
            question=q.question,
            options={
                "A": q.A,
                "B": q.B,
                "C": q.C,
                "D": q.D
            },
            correct_answer=q.answer.upper()
        ))
    return questions


@router.post("/", response_model=CreateSharedQuizResponse, status_code=status.HTTP_201_CREATED)
async def create_shared_quiz(
    request: CreateSharedQuizRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Tạo quiz chia sẻ mới
    Hỗ trợ 2 cách:
    1. Gửi questions array trực tiếp (từ LLM JSON)
    2. Gửi content string (parse thủ công)
    """
    logger.info(f"Creating shared quiz for user {current_user.id}: {request.title}")
    
    questions = []
    
    # Ưu tiên dùng questions array nếu có
    if request.questions and len(request.questions) > 0:
        logger.info(f"Using questions array: {len(request.questions)} questions")
        questions = convert_questions_input_to_quiz(request.questions)
    elif request.content:
        # Fallback: parse từ content
        logger.info("Parsing questions from content string")
        questions = parse_quiz_questions(request.content)
    
    if not questions:
        logger.error("No valid questions found")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không tìm thấy câu hỏi hợp lệ. Vui lòng kiểm tra lại nội dung trắc nghiệm."
        )
    
    logger.info(f"Total {len(questions)} valid questions")
    
    # Tạo share code unique
    share_code = generate_share_code()
    while True:
        result = await db.execute(select(SharedQuiz).where(SharedQuiz.share_code == share_code))
        if not result.scalar_one_or_none():
            break
        share_code = generate_share_code()
    
    # Tính thời gian hết hạn
    expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
    
    # Lưu content để backup
    content_to_save = request.content or ""
    if request.questions and not request.content:
        # Tạo content từ questions để backup
        lines = []
        for idx, q in enumerate(request.questions, 1):
            lines.append(f"Câu {idx}: {q.question}")
            lines.append(f"A. {q.A}")
            lines.append(f"B. {q.B}")
            lines.append(f"C. {q.C}")
            lines.append(f"D. {q.D}")
            lines.append(f"Đáp án: {q.answer}")
            lines.append("")
        content_to_save = "\n".join(lines)
    
    # Tạo quiz
    quiz = SharedQuiz(
        share_code=share_code,
        title=request.title,
        description=request.description,
        content=content_to_save,
        questions=[q.dict() for q in questions],
        total_questions=len(questions),
        time_limit=request.time_limit,
        creator_id=current_user.id,
        expires_at=expires_at,
        show_correct_answers=request.show_correct_answers,
        allow_multiple_attempts=request.allow_multiple_attempts,
    )
    
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    
    settings = get_settings()
    share_url = f"{settings.frontend_base_url}/quiz/{share_code}"
    
    logger.info(f"✅ Created quiz {quiz.id} with code {share_code}")
    
    return CreateSharedQuizResponse(
        quiz_id=quiz.id,
        share_code=share_code,
        share_url=share_url,
        title=quiz.title,
        total_questions=len(questions),
        expires_at=expires_at,
    )


@router.get("/my-quizzes", response_model=list[SharedQuizResponse])
async def get_my_quizzes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lấy danh sách quiz đã tạo
    """
    result = await db.execute(
        select(SharedQuiz, func.count(QuizResponse.id).label("response_count"))
        .outerjoin(QuizResponse)
        .where(SharedQuiz.creator_id == current_user.id)
        .group_by(SharedQuiz.id)
        .order_by(SharedQuiz.created_at.desc())
    )
    
    quizzes = []
    for quiz, response_count in result.all():
        quizzes.append(SharedQuizResponse(
            id=quiz.id,
            share_code=quiz.share_code,
            title=quiz.title,
            description=quiz.description,
            total_questions=quiz.total_questions,
            time_limit=quiz.time_limit,
            created_at=quiz.created_at,
            expires_at=quiz.expires_at,
            is_active=quiz.is_active,
            show_correct_answers=quiz.show_correct_answers,
            allow_multiple_attempts=quiz.allow_multiple_attempts,
            response_count=response_count or 0,
        ))
    
    return quizzes


@router.get("/public/{share_code}", response_model=QuizPublicResponse)
async def get_public_quiz(
    share_code: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Lấy thông tin quiz công khai (cho học sinh)
    """
    result = await db.execute(
        select(SharedQuiz).where(SharedQuiz.share_code == share_code)
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài trắc nghiệm"
        )
    
    if not quiz.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bài trắc nghiệm đã bị vô hiệu hóa"
        )
    
    if quiz.expires_at and quiz.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Bài trắc nghiệm đã hết hạn"
        )
    
    # Parse questions và xóa đáp án đúng
    questions = [QuizQuestion(**q) for q in quiz.questions]
    public_questions = []
    
    for q in questions:
        public_questions.append(QuizQuestion(
            id=q.id,
            question=q.question,
            options=q.options,
            correct_answer=""  # Ẩn đáp án đúng
        ))
    
    return QuizPublicResponse(
        title=quiz.title,
        description=quiz.description,
        total_questions=quiz.total_questions,
        time_limit=quiz.time_limit,
        questions=public_questions,
    )


@router.post("/public/{share_code}/submit", response_model=SubmitQuizResponse)
async def submit_quiz(
    share_code: str,
    request: SubmitQuizRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Nộp bài trắc nghiệm
    """
    # Lấy quiz
    result = await db.execute(
        select(SharedQuiz).where(SharedQuiz.share_code == share_code)
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz or not quiz.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài trắc nghiệm"
        )
    
    # Kiểm tra cho phép làm lại không
    if not quiz.allow_multiple_attempts:
        result = await db.execute(
            select(QuizResponse)
            .where(
                QuizResponse.quiz_id == quiz.id,
                QuizResponse.student_name == request.student_name,
                QuizResponse.student_class == request.student_class,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bạn đã nộp bài này rồi"
            )
    
    # Chấm điểm
    questions = [QuizQuestion(**q) for q in quiz.questions]
    total_correct = 0
    correct_answers = {}
    
    for q in questions:
        correct_answers[q.id] = q.correct_answer
        student_answer = request.answers.get(q.id, "").upper()
        if student_answer == q.correct_answer:
            total_correct += 1
    
    total_questions = len(questions)
    score = int((total_correct / total_questions) * 100) if total_questions > 0 else 0
    
    # Lưu kết quả
    response = QuizResponse(
        quiz_id=quiz.id,
        student_name=request.student_name,
        student_class=request.student_class,
        student_email=request.student_email,
        answers=request.answers,
        score=score,
        total_correct=total_correct,
        total_questions=total_questions,
        time_spent=request.time_spent,
    )
    
    db.add(response)
    await db.commit()
    await db.refresh(response)
    
    logger.info(f"✅ Quiz response {response.id}: {total_correct}/{total_questions} correct")
    
    return SubmitQuizResponse(
        response_id=response.id,
        score=score,
        total_correct=total_correct,
        total_questions=total_questions,
        percentage=round((total_correct / total_questions) * 100, 1) if total_questions > 0 else 0,
        correct_answers=correct_answers if quiz.show_correct_answers else None,
    )


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Xóa quiz
    """
    result = await db.execute(
        select(SharedQuiz).where(
            SharedQuiz.id == quiz_id,
            SharedQuiz.creator_id == current_user.id
        )
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài trắc nghiệm"
        )
    
    await db.delete(quiz)
    await db.commit()
    
    logger.info(f"✅ Deleted quiz {quiz_id}")


@router.patch("/{quiz_id}/toggle-active", response_model=SharedQuizResponse)
async def toggle_quiz_active(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Bật/tắt trạng thái active của quiz
    """
    result = await db.execute(
        select(SharedQuiz).where(
            SharedQuiz.id == quiz_id,
            SharedQuiz.creator_id == current_user.id
        )
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài trắc nghiệm"
        )
    
    quiz.is_active = not quiz.is_active
    await db.commit()
    await db.refresh(quiz)
    
    # Count responses
    count_result = await db.execute(
        select(func.count()).select_from(QuizResponse).where(QuizResponse.quiz_id == quiz_id)
    )
    response_count = count_result.scalar() or 0
    
    logger.info(f"✅ Toggled quiz {quiz_id} active to {quiz.is_active}")
    
    return SharedQuizResponse(
        id=quiz.id,
        share_code=quiz.share_code,
        title=quiz.title,
        description=quiz.description,
        total_questions=quiz.total_questions,
        time_limit=quiz.time_limit,
        created_at=quiz.created_at,
        expires_at=quiz.expires_at,
        is_active=quiz.is_active,
        show_correct_answers=quiz.show_correct_answers,
        allow_multiple_attempts=quiz.allow_multiple_attempts,
        response_count=response_count,
    )


@router.get("/{quiz_id}/responses", response_model=QuizResponsesListResponse)
async def get_quiz_responses(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Xem danh sách bài làm của học sinh
    """
    # Kiểm tra quyền
    result = await db.execute(
        select(SharedQuiz).where(
            SharedQuiz.id == quiz_id,
            SharedQuiz.creator_id == current_user.id
        )
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài trắc nghiệm"
        )
    
    # Lấy danh sách responses
    result = await db.execute(
        select(QuizResponse)
        .where(QuizResponse.quiz_id == quiz_id)
        .order_by(QuizResponse.submitted_at.desc())
    )
    responses = result.scalars().all()
    
    response_items = []
    for r in responses:
        response_items.append(QuizResponseItem(
            id=r.id,
            student_name=r.student_name,
            student_class=r.student_class,
            student_email=r.student_email,
            score=r.score,
            total_correct=r.total_correct,
            total_questions=r.total_questions,
            percentage=round((r.total_correct / r.total_questions) * 100, 1) if r.total_questions > 0 else 0,
            submitted_at=r.submitted_at,
            time_spent=r.time_spent,
        ))
    
    return QuizResponsesListResponse(
        quiz_title=quiz.title,
        total_responses=len(response_items),
        responses=response_items,
    )
