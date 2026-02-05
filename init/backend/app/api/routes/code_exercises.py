"""
API Routes cho bài tập lập trình (Code Exercises)
"""
import secrets
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.rate_limiter import limiter

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.code_exercise import CodeExercise, CodeSubmission
from app.models.submission_session import SubmissionSession
from app.schemas.shared_quiz import StartSessionRequest, StartSessionResponse
from app.schemas.code_exercise import (
    CreateCodeExerciseRequest,
    CreateCodeExerciseResponse,
    CodeExerciseResponse,
    CodeExercisePublic,
    CodeExerciseTeacherView,
    UpdateCodeExerciseRequest,
    TestCasePublic,
    TestCaseInput,
    RunCodeRequest,
    RunCodeResponse,
    SubmitCodeRequest,
    SubmitCodeResponse,
    TestResultItem,
    SubmissionItem,
    SubmissionsListResponse,
    ExtractCodeExercisesRequest,
    ExtractedExerciseItem,
    ExtractCodeExercisesResponse,
    HintRequest,
    HintResponse,
)
from app.services.piston_service import execute_code, run_test_cases
from app.services.code_extraction_service import get_code_extraction_service
from app.services.hint_service import get_hint_service
from app.core.config import get_settings

router = APIRouter(prefix="/code-exercises", tags=["Code Exercises"])
logger = logging.getLogger(__name__)


def generate_share_code() -> str:
    """Generate random 8-character share code"""
    return secrets.token_urlsafe(6)[:8]


# ============== GV Endpoints (Authenticated) ==============

@router.post("/", response_model=CreateCodeExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_code_exercise(
    request: CreateCodeExerciseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tạo bài tập lập trình mới"""
    logger.info(f"Creating code exercise for user {current_user.id}: {request.title}")

    # Generate unique share code
    share_code = generate_share_code()
    while True:
        result = await db.execute(
            select(CodeExercise).where(CodeExercise.share_code == share_code)
        )
        if not result.scalar_one_or_none():
            break
        share_code = generate_share_code()

    expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)

    exercise = CodeExercise(
        share_code=share_code,
        title=request.title,
        description=request.description,
        language=request.language,
        problem_statement=request.problem_statement,
        starter_code=request.starter_code,
        test_cases=[tc.dict() for tc in request.test_cases],
        time_limit_seconds=request.time_limit_seconds,
        memory_limit_mb=request.memory_limit_mb,
        lesson_info=request.lesson_info,
        creator_id=current_user.id,
        expires_at=expires_at,
    )

    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)

    settings = get_settings()
    share_url = f"{settings.frontend_base_url}/code/{share_code}"

    return CreateCodeExerciseResponse(
        exercise_id=exercise.id,
        share_code=share_code,
        share_url=share_url,
        title=exercise.title,
        total_test_cases=len(request.test_cases),
        expires_at=expires_at,
    )


@router.get("/my-exercises", response_model=list[CodeExerciseResponse])
async def get_my_exercises(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy danh sách bài tập đã tạo"""
    result = await db.execute(
        select(CodeExercise, func.count(CodeSubmission.id).label("submission_count"))
        .outerjoin(CodeSubmission)
        .where(CodeExercise.creator_id == current_user.id)
        .group_by(CodeExercise.id)
        .order_by(CodeExercise.created_at.desc())
    )

    exercises = []
    for exercise, submission_count in result.all():
        test_cases = exercise.test_cases or []
        exercises.append(CodeExerciseResponse(
            id=exercise.id,
            share_code=exercise.share_code,
            title=exercise.title,
            description=exercise.description,
            language=exercise.language,
            total_test_cases=len(test_cases),
            created_at=exercise.created_at,
            expires_at=exercise.expires_at,
            is_active=exercise.is_active,
            submission_count=submission_count,
            lesson_info=exercise.lesson_info,
        ))

    return exercises


@router.get("/{exercise_id}/submissions", response_model=SubmissionsListResponse)
async def get_exercise_submissions(
    exercise_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy danh sách bài nộp của học sinh"""
    result = await db.execute(
        select(CodeExercise).where(
            CodeExercise.id == exercise_id,
            CodeExercise.creator_id == current_user.id,
        )
    )
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")

    subs_result = await db.execute(
        select(CodeSubmission)
        .where(CodeSubmission.exercise_id == exercise_id)
        .order_by(CodeSubmission.submitted_at.desc())
    )
    submissions = subs_result.scalars().all()

    return SubmissionsListResponse(
        exercise_title=exercise.title,
        total_submissions=len(submissions),
        submissions=[
            SubmissionItem(
                id=s.id,
                student_name=s.student_name,
                student_class=s.student_class,
                student_group=s.student_group,
                status=s.status,
                total_tests=s.total_tests,
                passed_tests=s.passed_tests,
                percentage=round(s.passed_tests / s.total_tests * 100, 1) if s.total_tests > 0 else 0,
                code=s.code,
                submitted_at=s.submitted_at,
                execution_time_ms=s.execution_time_ms,
            )
            for s in submissions
        ],
    )


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Xóa bài tập"""
    result = await db.execute(
        select(CodeExercise).where(
            CodeExercise.id == exercise_id,
            CodeExercise.creator_id == current_user.id,
        )
    )
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")

    await db.delete(exercise)
    await db.commit()


@router.patch("/{exercise_id}/toggle-active")
async def toggle_exercise_active(
    exercise_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bật/tắt bài tập"""
    result = await db.execute(
        select(CodeExercise).where(
            CodeExercise.id == exercise_id,
            CodeExercise.creator_id == current_user.id,
        )
    )
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")

    exercise.is_active = not exercise.is_active
    await db.commit()

    return {"message": "Đã cập nhật", "is_active": exercise.is_active}


@router.get("/{exercise_id}/statistics")
async def get_exercise_statistics(
    exercise_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy thống kê bài tập lập trình"""
    result = await db.execute(
        select(CodeExercise).where(
            CodeExercise.id == exercise_id,
            CodeExercise.creator_id == current_user.id,
        )
    )
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")

    # Get all submissions
    subs_result = await db.execute(
        select(CodeSubmission)
        .where(CodeSubmission.exercise_id == exercise_id)
    )
    submissions = subs_result.scalars().all()

    total = len(submissions)
    if total == 0:
        return {
            "total_submissions": 0,
            "pass_rate": 0,
            "average_percentage": 0,
            "highest_percentage": 0,
            "lowest_percentage": 0,
            "average_execution_time_ms": 0,
            "status_distribution": {"passed": 0, "failed": 0, "error": 0, "timeout": 0},
            "score_distribution": {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0},
        }

    percentages = []
    exec_times = []
    status_counts = {"passed": 0, "failed": 0, "error": 0, "timeout": 0}
    score_dist = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}

    for sub in submissions:
        pct = round(sub.passed_tests / sub.total_tests * 100, 1) if sub.total_tests > 0 else 0
        percentages.append(pct)
        
        if sub.execution_time_ms:
            exec_times.append(sub.execution_time_ms)
        
        status = sub.status or "failed"
        if status in status_counts:
            status_counts[status] += 1
        else:
            status_counts["failed"] += 1
        
        if pct <= 20:
            score_dist["0-20"] += 1
        elif pct <= 40:
            score_dist["21-40"] += 1
        elif pct <= 60:
            score_dist["41-60"] += 1
        elif pct <= 80:
            score_dist["61-80"] += 1
        else:
            score_dist["81-100"] += 1

    avg_pct = round(sum(percentages) / len(percentages), 1) if percentages else 0
    avg_exec = round(sum(exec_times) / len(exec_times), 1) if exec_times else 0

    return {
        "total_submissions": total,
        "pass_rate": round(status_counts["passed"] / total * 100, 1),
        "average_percentage": avg_pct,
        "highest_percentage": max(percentages) if percentages else 0,
        "lowest_percentage": min(percentages) if percentages else 0,
        "average_execution_time_ms": avg_exec,
        "status_distribution": status_counts,
        "score_distribution": score_dist,
    }


# ============== Code Extraction from KHBD ==============

@router.post("/extract-from-lesson", response_model=ExtractCodeExercisesResponse)
async def extract_code_exercises_from_lesson(
    request: ExtractCodeExercisesRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trích xuất bài tập lập trình từ KHBD đã sinh và tạo test cases tự động"""
    logger.info(f"Extracting code exercises from lesson plan for user {current_user.id}")

    service = get_code_extraction_service()
    result = service.extract_exercises(
        lesson_plan_content=request.lesson_plan_content,
        lesson_info=request.lesson_info,
    )

    found = result.get("found", False)
    exercises_data = result.get("exercises", [])

    # Parse exercises thành schema
    exercises = []
    for ex_data in exercises_data:
        test_cases = [
            TestCaseInput(
                input=tc.get("input", ""),
                expected_output=tc.get("expected_output", ""),
                is_hidden=tc.get("is_hidden", False),
            )
            for tc in ex_data.get("test_cases", [])
        ]
        exercises.append(ExtractedExerciseItem(
            title=ex_data.get("title", ""),
            description=ex_data.get("description", ""),
            source_activity=ex_data.get("source_activity", ""),
            language=ex_data.get("language", "python"),
            starter_code=ex_data.get("starter_code"),
            test_cases=test_cases,
            lesson_info=ex_data.get("lesson_info") or request.lesson_info,
        ))

    # Nếu auto_create=true, tạo CodeExercise records
    created_exercises = None
    if request.auto_create and found and exercises:
        created_exercises = []
        settings = get_settings()

        for ex in exercises:
            share_code = generate_share_code()
            while True:
                check = await db.execute(
                    select(CodeExercise).where(CodeExercise.share_code == share_code)
                )
                if not check.scalar_one_or_none():
                    break
                share_code = generate_share_code()

            expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)

            code_exercise = CodeExercise(
                share_code=share_code,
                title=ex.title,
                description=ex.description,
                language=ex.language,
                problem_statement=ex.description,
                starter_code=ex.starter_code,
                test_cases=[tc.dict() for tc in ex.test_cases],
                time_limit_seconds=5,
                memory_limit_mb=128,
                lesson_info=ex.lesson_info,
                creator_id=current_user.id,
                expires_at=expires_at,
            )
            db.add(code_exercise)
            await db.flush()

            share_url = f"{settings.frontend_base_url}/code/{share_code}"
            created_exercises.append(CreateCodeExerciseResponse(
                exercise_id=code_exercise.id,
                share_code=share_code,
                share_url=share_url,
                title=code_exercise.title,
                total_test_cases=len(ex.test_cases),
                expires_at=expires_at,
            ))

        await db.commit()

    return ExtractCodeExercisesResponse(
        found=found,
        exercises=exercises,
        reason=result.get("reason"),
        created_exercises=created_exercises,
    )


# ============== Teacher View on Public Page ==============

@router.get("/public/{share_code}/teacher", response_model=CodeExerciseTeacherView)
async def get_exercise_teacher_view(
    share_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy thông tin bài tập đầy đủ (cho giáo viên/creator)"""
    result = await db.execute(
        select(CodeExercise).where(CodeExercise.share_code == share_code)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")
    if exercise.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem")

    all_test_cases = exercise.test_cases or []
    return CodeExerciseTeacherView(
        title=exercise.title,
        description=exercise.description,
        language=exercise.language,
        problem_statement=exercise.problem_statement,
        starter_code=exercise.starter_code,
        test_cases=[
            TestCaseInput(
                input=tc.get("input", ""),
                expected_output=tc.get("expected_output", ""),
                is_hidden=tc.get("is_hidden", False),
            )
            for tc in all_test_cases
        ],
        time_limit_seconds=exercise.time_limit_seconds,
    )


@router.put("/public/{share_code}/update")
async def update_exercise_by_share_code(
    share_code: str,
    request: UpdateCodeExerciseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cập nhật bài tập (chỉ creator)"""
    result = await db.execute(
        select(CodeExercise).where(CodeExercise.share_code == share_code)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")
    if exercise.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa")

    if request.starter_code is not None:
        exercise.starter_code = request.starter_code
    if request.test_cases is not None:
        exercise.test_cases = [tc.dict() for tc in request.test_cases]

    await db.commit()
    return {"message": "Đã cập nhật bài tập"}


# ============== Public Endpoints (Học sinh) ==============

@router.get("/public/{share_code}", response_model=CodeExercisePublic)
@limiter.limit("30/minute")
async def get_public_exercise(
    request: Request,
    share_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Lấy thông tin bài tập công khai (cho học sinh)"""
    result = await db.execute(
        select(CodeExercise).where(CodeExercise.share_code == share_code)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")

    if not exercise.is_active:
        raise HTTPException(status_code=403, detail="Bài tập đã bị tắt")

    if exercise.expires_at and exercise.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Bài tập đã hết hạn")

    # Chỉ trả về test cases công khai (không hidden)
    all_test_cases = exercise.test_cases or []
    public_test_cases = [
        TestCasePublic(input=tc["input"], expected_output=tc["expected_output"])
        for tc in all_test_cases
        if not tc.get("is_hidden", False)
    ]

    return CodeExercisePublic(
        title=exercise.title,
        description=exercise.description,
        language=exercise.language,
        problem_statement=exercise.problem_statement,
        starter_code=exercise.starter_code,
        test_cases=public_test_cases,
        time_limit_seconds=exercise.time_limit_seconds,
    )


@router.post("/public/{share_code}/run", response_model=RunCodeResponse)
@limiter.limit("10/minute")
async def run_code_public(
    request: Request,
    share_code: str,
    body: RunCodeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Chạy code thử (không chấm điểm)"""
    result = await db.execute(
        select(CodeExercise).where(CodeExercise.share_code == share_code)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")
    if not exercise.is_active:
        raise HTTPException(status_code=403, detail="Bài tập đã bị tắt")

    exec_result = await execute_code(
        code=body.code,
        language=body.language or exercise.language,
        stdin=body.stdin,
        timeout_seconds=exercise.time_limit_seconds,
    )

    return RunCodeResponse(
        stdout=exec_result["stdout"],
        stderr=exec_result["stderr"],
        exit_code=exec_result["exit_code"],
        execution_time_ms=exec_result["execution_time_ms"],
        timed_out=exec_result["timed_out"],
    )


@router.post("/public/{share_code}/start-session", response_model=StartSessionResponse)
@limiter.limit("10/minute")
async def start_code_session(
    request: Request,
    share_code: str,
    body: StartSessionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Bắt đầu phiên làm bài tập code - trả về session token"""
    result = await db.execute(
        select(CodeExercise).where(CodeExercise.share_code == share_code)
    )
    exercise = result.scalar_one_or_none()

    if not exercise or not exercise.is_active:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")

    if exercise.expires_at and exercise.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Bài tập đã hết hạn")

    client_ip = request.client.host if request.client else None
    session = SubmissionSession(
        share_code=share_code,
        resource_type="code_exercise",
        student_name=body.student_name,
        student_class=body.student_class,
        ip_address=client_ip,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return StartSessionResponse(session_token=session.session_token)


@router.post("/public/{share_code}/submit", response_model=SubmitCodeResponse)
@limiter.limit("5/minute")
async def submit_code(
    request: Request,
    share_code: str,
    body: SubmitCodeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Nộp bài và chấm điểm"""
    # Verify session token
    session_result = await db.execute(
        select(SubmissionSession).where(
            SubmissionSession.session_token == body.session_token,
            SubmissionSession.share_code == share_code,
            SubmissionSession.resource_type == "code_exercise",
            SubmissionSession.student_name == body.student_name,
            SubmissionSession.student_class == body.student_class,
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Phiên làm bài không hợp lệ. Vui lòng bắt đầu lại."
        )
    if session.expires_at and session.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Phiên làm bài đã hết hạn. Vui lòng bắt đầu lại."
        )

    result = await db.execute(
        select(CodeExercise).where(CodeExercise.share_code == share_code)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")
    if not exercise.is_active:
        raise HTTPException(status_code=403, detail="Bài tập đã bị tắt")
    if exercise.expires_at and exercise.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Bài tập đã hết hạn")

    # Chạy code với tất cả test cases (bao gồm hidden)
    all_test_cases = exercise.test_cases or []
    grading_result = await run_test_cases(
        code=body.code,
        test_cases=all_test_cases,
        language=body.language or exercise.language,
        timeout_seconds=exercise.time_limit_seconds,
    )

    # Lưu submission
    total_tests = grading_result["total_tests"]
    passed_tests = grading_result["passed_tests"]

    submission = CodeSubmission(
        exercise_id=exercise.id,
        student_name=body.student_name,
        student_class=body.student_class,
        student_group=body.student_group,
        code=body.code,
        language=body.language or exercise.language,
        status=grading_result["status"],
        total_tests=total_tests,
        passed_tests=passed_tests,
        test_results=grading_result["test_results"],
        error_message=None,
        execution_time_ms=grading_result["execution_time_ms"],
    )

    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # Trả kết quả cho học sinh (chỉ hiển thị test cases công khai)
    visible_results = [
        TestResultItem(
            test_num=tr["test_num"],
            input=tr["input"],
            expected_output=tr["expected_output"],
            actual_output=tr["actual_output"],
            passed=tr["passed"],
            is_hidden=tr["is_hidden"],
            error=tr.get("error"),
        )
        for tr in grading_result["test_results"]
        if not tr["is_hidden"]
    ]

    # Thêm summary cho hidden test cases
    hidden_results = [tr for tr in grading_result["test_results"] if tr["is_hidden"]]
    if hidden_results:
        hidden_passed = sum(1 for tr in hidden_results if tr["passed"])
        hidden_total = len(hidden_results)
        visible_results.append(
            TestResultItem(
                test_num=len(visible_results) + 1,
                input="(ẩn)",
                expected_output="(ẩn)",
                actual_output=f"Đạt {hidden_passed}/{hidden_total} test cases ẩn",
                passed=hidden_passed == hidden_total,
                is_hidden=True,
                error=None,
            )
        )

    percentage = round(passed_tests / total_tests * 100, 1) if total_tests > 0 else 0

    return SubmitCodeResponse(
        submission_id=submission.id,
        status=grading_result["status"],
        total_tests=total_tests,
        passed_tests=passed_tests,
        percentage=percentage,
        test_results=visible_results,
        execution_time_ms=grading_result["execution_time_ms"],
    )


@router.post("/public/{share_code}/hint", response_model=HintResponse)
@limiter.limit("10/minute")
async def get_hint(
    request: Request,
    share_code: str,
    body: HintRequest,
    db: AsyncSession = Depends(get_db),
):
    """Phân tích lỗi tổng hợp cho các test case sai (public, không cần auth)"""
    result = await db.execute(
        select(CodeExercise).where(CodeExercise.share_code == share_code)
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Bài tập không tồn tại")
    if not exercise.is_active:
        raise HTTPException(status_code=403, detail="Bài tập đã bị tắt")
    if exercise.expires_at and exercise.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Bài tập đã hết hạn")

    hint_service = get_hint_service()
    hint_text = await hint_service.generate_hint(
        problem_statement=exercise.problem_statement,
        language=exercise.language,
        student_code=body.code,
        failed_tests=[t.model_dump() for t in body.failed_tests],
    )

    return HintResponse(hint=hint_text)
