"""
API Routes cho Code Exercises - Bài tập Ghép thẻ code và Viết code
"""
import logging
import secrets
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.code_exercise import SharedCodeExercise, CodeExerciseSubmission
from app.core.config import get_settings
from app.schemas.code_exercise import (
    CreateCodeExerciseRequest,
    CreateCodeExerciseResponse,
    PublicCodeExerciseResponse,
    SubmitParsonsRequest,
    SubmitCodingRequest,
    SubmitCodeExerciseResponse,
    TestResult,
    SubmissionListResponse,
    SubmissionListItem,
    SubmissionDetail,
    MyCodeExercisesResponse,
    MyCodeExerciseItem,
    ParsonsBlock,
    GenerateCodeExerciseRequest,
    GenerateCodeExerciseResponse,
    GeneratedParsonsExercise,
    GeneratedCodingExercise,
    TestCase,
)

router = APIRouter()
logger = logging.getLogger(__name__)


def generate_share_code(length: int = 8) -> str:
    """Tạo share code ngẫu nhiên"""
    alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ============== GIÁO VIÊN: Tạo/Share bài tập ==============

@router.post("/", response_model=CreateCodeExerciseResponse)
async def create_code_exercise(
    request: CreateCodeExerciseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tạo và share bài tập code"""
    logger.info(f"Creating {request.exercise_type} exercise: {request.title}")
    
    # Validate exercise data
    if request.exercise_type == "parsons":
        if not request.parsons_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="parsons_data is required for parsons exercise"
            )
        exercise_data = request.parsons_data.model_dump()
    elif request.exercise_type == "coding":
        if not request.coding_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="coding_data is required for coding exercise"
            )
        exercise_data = request.coding_data.model_dump()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="exercise_type must be 'parsons' or 'coding'"
        )
    
    # Generate unique share code
    share_code = generate_share_code()
    while True:
        result = await db.execute(
            select(SharedCodeExercise).where(SharedCodeExercise.share_code == share_code)
        )
        if not result.scalar_one_or_none():
            break
        share_code = generate_share_code()
    
    # Calculate expiration
    expires_at = datetime.now(timezone.utc) + timedelta(days=request.expires_in_days)
    
    # Create exercise
    exercise = SharedCodeExercise(
        share_code=share_code,
        exercise_type=request.exercise_type,
        title=request.title,
        description=request.description,
        language=request.language,
        difficulty=request.difficulty,
        exercise_data=exercise_data,
        creator_id=current_user.id,
        lesson_plan_id=request.lesson_plan_id,
        expires_at=expires_at,
    )
    
    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)
    
    settings = get_settings()
    share_url = f"{settings.frontend_base_url}/code/{request.exercise_type}/{share_code}"
    
    logger.info(f"✅ Created exercise {exercise.id} with code {share_code}")
    
    return CreateCodeExerciseResponse(
        exercise_id=exercise.id,
        share_code=share_code,
        share_url=share_url,
        title=exercise.title,
        exercise_type=exercise.exercise_type,
        expires_at=expires_at,
    )


# ============== PUBLIC: Lấy bài tập (cho học sinh) ==============

@router.get("/public/{share_code}", response_model=PublicCodeExerciseResponse)
async def get_public_exercise(
    share_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Lấy bài tập để học sinh làm (đã ẩn đáp án)"""
    from sqlalchemy.orm import selectinload
    from app.models.profile import Profile
    
    result = await db.execute(
        select(SharedCodeExercise)
        .options(
            selectinload(SharedCodeExercise.creator).selectinload(User.profile)
        )
        .where(
            SharedCodeExercise.share_code == share_code,
            SharedCodeExercise.is_active == True
        )
    )
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài tập hoặc bài tập đã hết hạn"
        )
    
    # Check expiration - handle both naive and aware datetimes
    if exercise.expires_at:
        expires_at = exercise.expires_at
        # Convert naive datetime to UTC if needed
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Bài tập đã hết hạn"
            )
    
    # Get creator name
    creator_name = None
    if exercise.creator:
        if exercise.creator.profile and exercise.creator.profile.full_name:
            creator_name = exercise.creator.profile.full_name
        else:
            creator_name = exercise.creator.email.split("@")[0]
    
    # Prepare public data (hide answers)
    exercise_data = exercise.exercise_data
    
    if exercise.exercise_type == "parsons":
        # Xáo trộn blocks + thêm distractors, ẩn correct_order
        blocks = [ParsonsBlock(**b) for b in exercise_data.get("blocks", [])]
        distractors = [ParsonsBlock(**d) for d in exercise_data.get("distractors", [])]
        
        # Trộn blocks với distractors
        all_blocks = blocks + distractors
        random.shuffle(all_blocks)
        
        parsons_data = {
            "blocks": [b.model_dump() for b in all_blocks]
            # KHÔNG có correct_order
        }
        coding_data = None
    else:
        # Ẩn solution_code và test_code
        parsons_data = None
        test_cases = exercise_data.get("test_cases", [])
        # Chỉ hiện test cases không hidden
        visible_test_cases = [tc for tc in test_cases if not tc.get("hidden", False)]
        
        coding_data = {
            "starter_code": exercise_data.get("starter_code", ""),
            "test_cases": visible_test_cases,
            "hints": exercise_data.get("hints", [])
            # KHÔNG có solution_code, test_code
        }
    
    return PublicCodeExerciseResponse(
        share_code=share_code,
        exercise_type=exercise.exercise_type,
        title=exercise.title,
        description=exercise.description or "",
        language=exercise.language,
        difficulty=exercise.difficulty,
        parsons_data=parsons_data,
        coding_data=coding_data,
        creator_name=creator_name,
        created_at=exercise.created_at,
    )


# ============== PUBLIC: Nộp bài ==============

@router.post("/public/{share_code}/submit/parsons", response_model=SubmitCodeExerciseResponse)
async def submit_parsons(
    share_code: str,
    request: SubmitParsonsRequest,
    db: AsyncSession = Depends(get_db),
):
    """Nộp bài ghép thẻ"""
    result = await db.execute(
        select(SharedCodeExercise).where(
            SharedCodeExercise.share_code == share_code,
            SharedCodeExercise.is_active == True,
            SharedCodeExercise.exercise_type == "parsons"
        )
    )
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài tập"
        )
    
    # Check expiration
    if exercise.expires_at and exercise.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Bài tập đã hết hạn"
        )
    
    # Chấm điểm
    exercise_data = exercise.exercise_data
    correct_order = exercise_data.get("correct_order", [])
    submitted_order = request.submitted_order
    
    # So sánh thứ tự
    is_correct = submitted_order == correct_order
    
    # Tính điểm từng phần
    if is_correct:
        score = 100
    else:
        # Đếm số vị trí đúng
        correct_positions = 0
        for i, block_id in enumerate(submitted_order):
            if i < len(correct_order) and correct_order[i] == block_id:
                correct_positions += 1
        
        score = int((correct_positions / max(len(correct_order), 1)) * 100)
    
    # Tạo feedback
    if is_correct:
        feedback = "🎉 Xuất sắc! Bạn đã sắp xếp đúng tất cả các dòng code!"
    elif score >= 70:
        feedback = f"👍 Tốt lắm! Bạn đã đúng {score}% vị trí. Hãy kiểm tra lại thứ tự các dòng."
    elif score >= 40:
        feedback = f"💪 Cố gắng thêm! Bạn đúng {score}% vị trí. Chú ý logic của chương trình."
    else:
        feedback = f"📚 Hãy xem lại kiến thức! Bạn chỉ đúng {score}% vị trí."
    
    # Lưu submission
    submission = CodeExerciseSubmission(
        exercise_id=exercise.id,
        student_name=request.student_name,
        submitted_order=submitted_order,
        score=score,
        is_correct=is_correct,
        feedback=feedback,
    )
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    logger.info(f"Parsons submission: {request.student_name} - Score: {score}")
    
    return SubmitCodeExerciseResponse(
        submission_id=submission.id,
        is_correct=is_correct,
        score=score,
        feedback=feedback,
        submitted_at=submission.submitted_at,
    )


@router.post("/public/{share_code}/submit/coding", response_model=SubmitCodeExerciseResponse)
async def submit_coding(
    share_code: str,
    request: SubmitCodingRequest,
    db: AsyncSession = Depends(get_db),
):
    """Nộp bài viết code - chấm bằng cách chạy test"""
    result = await db.execute(
        select(SharedCodeExercise).where(
            SharedCodeExercise.share_code == share_code,
            SharedCodeExercise.is_active == True,
            SharedCodeExercise.exercise_type == "coding"
        )
    )
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài tập"
        )
    
    # Check expiration
    if exercise.expires_at and exercise.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Bài tập đã hết hạn"
        )
    
    exercise_data = exercise.exercise_data
    test_cases = exercise_data.get("test_cases", [])
    test_code = exercise_data.get("test_code", "")
    
    # Chạy code với test cases
    test_results = []
    passed_count = 0
    total_count = len(test_cases)
    
    # Sử dụng exec để chạy code (CẨN THẬN - nên dùng sandbox trong production)
    # Ở đây ta sẽ trả về kết quả đơn giản và để frontend chạy Pyodide
    # Backend chỉ lưu submission và tính điểm dựa trên input từ frontend
    
    # Với implementation đơn giản, ta gửi test_code về cho frontend chạy
    # Hoặc ta có thể dùng LLM để đánh giá code
    
    # Tạm thời: Chỉ lưu submission, điểm sẽ được cập nhật sau khi frontend chạy test
    submission = CodeExerciseSubmission(
        exercise_id=exercise.id,
        student_name=request.student_name,
        submitted_code=request.submitted_code,
        score=0,  # Sẽ được cập nhật
        is_correct=False,
        feedback="Đang chấm bài...",
    )
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    logger.info(f"Coding submission received: {request.student_name}")
    
    # Trả về test_code để frontend chạy
    return SubmitCodeExerciseResponse(
        submission_id=submission.id,
        is_correct=False,
        score=0,
        total_tests=total_count,
        passed_tests=0,
        test_results=[],
        feedback="Đang chờ kết quả từ trình chạy code...",
        submitted_at=submission.submitted_at,
    )


@router.put("/public/submission/{submission_id}/result")
async def update_submission_result(
    submission_id: int,
    score: int,
    is_correct: bool,
    passed_tests: int,
    total_tests: int,
    test_results: List[dict],
    feedback: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật kết quả submission sau khi frontend chạy test"""
    result = await db.execute(
        select(CodeExerciseSubmission).where(CodeExerciseSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài nộp"
        )
    
    submission.score = score
    submission.is_correct = is_correct
    submission.test_results = test_results
    
    # Tạo feedback
    if is_correct:
        submission.feedback = "🎉 Xuất sắc! Code của bạn vượt qua tất cả test cases!"
    elif score >= 70:
        submission.feedback = f"👍 Tốt lắm! Đạt {passed_tests}/{total_tests} test cases."
    elif score >= 40:
        submission.feedback = f"💪 Cố gắng thêm! Chỉ đạt {passed_tests}/{total_tests} test cases."
    else:
        submission.feedback = f"📚 Hãy xem lại code! Chỉ đạt {passed_tests}/{total_tests} test cases."
    
    if feedback:
        submission.feedback = feedback
    
    await db.commit()
    
    return {"message": "Cập nhật kết quả thành công", "score": score}


# ============== GIÁO VIÊN: Quản lý bài tập ==============

@router.get("/my", response_model=MyCodeExercisesResponse)
async def get_my_exercises(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy danh sách bài tập của giáo viên"""
    result = await db.execute(
        select(SharedCodeExercise)
        .where(SharedCodeExercise.creator_id == current_user.id)
        .order_by(SharedCodeExercise.created_at.desc())
    )
    exercises = result.scalars().all()
    
    items = []
    for ex in exercises:
        # Đếm submissions
        sub_result = await db.execute(
            select(func.count(CodeExerciseSubmission.id))
            .where(CodeExerciseSubmission.exercise_id == ex.id)
        )
        submission_count = sub_result.scalar() or 0
        
        # Tính điểm trung bình
        avg_result = await db.execute(
            select(func.avg(CodeExerciseSubmission.score))
            .where(CodeExerciseSubmission.exercise_id == ex.id)
        )
        average_score = avg_result.scalar()
        
        items.append(MyCodeExerciseItem(
            id=ex.id,
            share_code=ex.share_code,
            exercise_type=ex.exercise_type,
            title=ex.title,
            difficulty=ex.difficulty,
            submission_count=submission_count,
            average_score=round(average_score, 1) if average_score else None,
            is_active=ex.is_active,
            created_at=ex.created_at,
            expires_at=ex.expires_at,
        ))
    
    return MyCodeExercisesResponse(
        exercises=items,
        total=len(items),
    )


@router.get("/{share_code}/submissions", response_model=SubmissionListResponse)
async def get_exercise_submissions(
    share_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Xem danh sách bài nộp của một bài tập"""
    result = await db.execute(
        select(SharedCodeExercise).where(
            SharedCodeExercise.share_code == share_code,
            SharedCodeExercise.creator_id == current_user.id
        )
    )
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài tập hoặc bạn không có quyền xem"
        )
    
    # Get submissions
    sub_result = await db.execute(
        select(CodeExerciseSubmission)
        .where(CodeExerciseSubmission.exercise_id == exercise.id)
        .order_by(CodeExerciseSubmission.submitted_at.desc())
    )
    submissions = sub_result.scalars().all()
    
    items = [
        SubmissionListItem(
            id=s.id,
            student_name=s.student_name,
            score=s.score,
            is_correct=s.is_correct,
            submitted_at=s.submitted_at,
        )
        for s in submissions
    ]
    
    # Calculate average
    scores = [s.score for s in submissions]
    average_score = sum(scores) / len(scores) if scores else 0
    
    return SubmissionListResponse(
        exercise_title=exercise.title,
        exercise_type=exercise.exercise_type,
        submissions=items,
        total=len(items),
        average_score=round(average_score, 1),
    )


@router.delete("/{share_code}")
async def delete_exercise(
    share_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Xóa/hủy bài tập"""
    result = await db.execute(
        select(SharedCodeExercise).where(
            SharedCodeExercise.share_code == share_code,
            SharedCodeExercise.creator_id == current_user.id
        )
    )
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài tập"
        )
    
    await db.delete(exercise)
    await db.commit()
    
    return {"message": "Đã xóa bài tập thành công"}


@router.put("/{share_code}/toggle")
async def toggle_exercise_active(
    share_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bật/tắt bài tập"""
    result = await db.execute(
        select(SharedCodeExercise).where(
            SharedCodeExercise.share_code == share_code,
            SharedCodeExercise.creator_id == current_user.id
        )
    )
    exercise = result.scalar_one_or_none()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài tập"
        )
    
    exercise.is_active = not exercise.is_active
    await db.commit()
    
    status_text = "bật" if exercise.is_active else "tắt"
    return {"message": f"Đã {status_text} bài tập", "is_active": exercise.is_active}


# ============== TẠO BÀI TẬP BẰNG AI ==============

@router.post("/generate", response_model=GenerateCodeExerciseResponse)
async def generate_code_exercise(
    request: GenerateCodeExerciseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Tạo bài tập code (Parsons hoặc Coding) từ nội dung section bằng AI
    """
    import json
    import re
    from openai import AsyncOpenAI
    
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    if request.exercise_type == "parsons":
        system_prompt = """Bạn là trợ lý tạo bài tập lập trình. 
Nhiệm vụ: Tạo bài tập "Ghép thẻ code" (Parsons Problem) từ nội dung bài học.

Bài tập Ghép thẻ code: Học sinh sắp xếp các dòng code theo đúng thứ tự để tạo chương trình hoàn chỉnh.

Yêu cầu:
1. Tạo 5-10 blocks code, mỗi block là một dòng hoặc một nhóm dòng liên quan
2. Mỗi block có id duy nhất (block_1, block_2, ...)
3. Trường indent cho biết mức thụt đầu dòng (0 = không thụt, 1 = 1 level, ...)
4. correct_order là danh sách id theo thứ tự đúng
5. Có thể thêm 1-2 distractors (dòng code sai/nhiễu) để tăng độ khó

Trả về JSON theo format:
{
  "title": "Tiêu đề bài tập ngắn gọn",
  "description": "Mô tả yêu cầu bài tập",
  "blocks": [
    {"id": "block_1", "content": "def hello():", "indent": 0},
    {"id": "block_2", "content": "print('Hello')", "indent": 1}
  ],
  "correct_order": ["block_1", "block_2"],
  "distractors": [
    {"id": "distractor_1", "content": "return None", "indent": 1}
  ]
}"""
        
        user_prompt = f"""Nội dung bài học:
{request.section_content}

Tên bài: {request.lesson_name}
Phần: {request.section_title}
Độ khó: {request.difficulty}
Ngôn ngữ: {request.language}

Tạo một bài tập Ghép thẻ code phù hợp với nội dung trên. Chỉ trả về JSON, không giải thích."""

    else:  # coding
        system_prompt = """Bạn là trợ lý tạo bài tập lập trình.
Nhiệm vụ: Tạo bài tập "Viết code" từ nội dung bài học.

Bài tập Viết code: Học sinh viết code để giải quyết yêu cầu và chạy test cases.

Yêu cầu:
1. starter_code: Code khung có sẵn với TODO comments
2. solution_code: Code đáp án đầy đủ
3. test_code: Các assert statements để kiểm tra
4. test_cases: 3-5 test cases với input/expected output
5. hints: 2-3 gợi ý giúp học sinh

Trả về JSON theo format:
{
  "title": "Tiêu đề bài tập",
  "description": "Mô tả yêu cầu chi tiết",
  "starter_code": "def function():\\n    # TODO: Viết code tại đây\\n    pass",
  "solution_code": "def function():\\n    return result",
  "test_code": "assert function() == expected\\nassert function(1) == 1",
  "test_cases": [
    {"input": "", "expected": "output", "hidden": false}
  ],
  "hints": ["Gợi ý 1", "Gợi ý 2"]
}"""

        user_prompt = f"""Nội dung bài học:
{request.section_content}

Tên bài: {request.lesson_name}
Phần: {request.section_title}
Độ khó: {request.difficulty}
Ngôn ngữ: {request.language}

Tạo một bài tập Viết code phù hợp với nội dung trên. Chỉ trả về JSON, không giải thích."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Trích xuất JSON từ response
        json_match = re.search(r'\{[\s\S]*\}', content)
        if not json_match:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể phân tích response từ AI"
            )
        
        data = json.loads(json_match.group())
        
        if request.exercise_type == "parsons":
            parsons = GeneratedParsonsExercise(
                title=data.get("title", "Bài tập Ghép thẻ code"),
                description=data.get("description", ""),
                blocks=[ParsonsBlock(**b) for b in data.get("blocks", [])],
                correct_order=data.get("correct_order", []),
                distractors=[ParsonsBlock(**d) for d in data.get("distractors", [])] if data.get("distractors") else None
            )
            return GenerateCodeExerciseResponse(
                exercise_type="parsons",
                parsons_exercise=parsons
            )
        else:
            coding = GeneratedCodingExercise(
                title=data.get("title", "Bài tập Viết code"),
                description=data.get("description", ""),
                starter_code=data.get("starter_code", ""),
                solution_code=data.get("solution_code", ""),
                test_code=data.get("test_code", ""),
                test_cases=[TestCase(**tc) for tc in data.get("test_cases", [])],
                hints=data.get("hints")
            )
            return GenerateCodeExerciseResponse(
                exercise_type="coding",
                coding_exercise=coding
            )
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi phân tích dữ liệu từ AI"
        )
    except Exception as e:
        logger.error(f"Generate error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tạo bài tập: {str(e)}"
        )
