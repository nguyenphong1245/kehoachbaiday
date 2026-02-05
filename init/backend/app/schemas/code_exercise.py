"""
Schemas cho bài tập lập trình (Code Exercises)
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class TestCaseInput(BaseModel):
    """Test case cho bài tập"""
    input: str = ""  # Input (stdin)
    expected_output: str  # Output mong đợi
    is_hidden: bool = False  # Ẩn test case với học sinh


class CreateCodeExerciseRequest(BaseModel):
    """Request tạo bài tập lập trình"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    language: str = Field(default="python", pattern="^(python|javascript|java|cpp|c)$")
    problem_statement: str = Field(..., min_length=1)
    starter_code: Optional[str] = None
    test_cases: List[TestCaseInput] = Field(..., min_length=1)
    time_limit_seconds: int = Field(default=5, ge=1, le=30)
    memory_limit_mb: int = Field(default=128, ge=16, le=512)
    expires_in_days: int = Field(default=30, ge=1, le=365)
    lesson_info: Optional[dict] = None


class CreateCodeExerciseResponse(BaseModel):
    """Response sau khi tạo bài tập"""
    exercise_id: int
    share_code: str
    share_url: str
    title: str
    total_test_cases: int
    expires_at: datetime


class CodeExerciseResponse(BaseModel):
    """Thông tin bài tập (cho giáo viên)"""
    id: int
    share_code: str
    title: str
    description: Optional[str]
    language: str
    total_test_cases: int
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    submission_count: int
    lesson_info: Optional[dict] = None

    class Config:
        from_attributes = True


class TestCasePublic(BaseModel):
    """Test case công khai (không bao gồm hidden)"""
    input: str
    expected_output: str


class CodeExercisePublic(BaseModel):
    """Thông tin bài tập công khai (cho học sinh)"""
    title: str
    description: Optional[str]
    language: str
    problem_statement: str
    starter_code: Optional[str]
    test_cases: List[TestCasePublic]  # Chỉ test cases công khai
    time_limit_seconds: int


class RunCodeRequest(BaseModel):
    """Request chạy code (không chấm điểm)"""
    code: str = Field(..., min_length=1, max_length=50000)
    language: str = Field(default="python")
    stdin: str = Field(default="", max_length=10000)


class RunCodeResponse(BaseModel):
    """Response sau khi chạy code"""
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: Optional[int] = None
    timed_out: bool = False


class SubmitCodeRequest(BaseModel):
    """Request nộp bài"""
    student_name: str = Field(..., min_length=1, max_length=200)
    student_class: str = Field(..., min_length=1, max_length=100)
    student_group: Optional[str] = Field(None, max_length=100)
    code: str = Field(..., min_length=1, max_length=50000)
    language: str = Field(default="python")
    session_token: str = Field(..., description="Token phiên làm bài từ start-session")


class TestResultItem(BaseModel):
    """Kết quả từng test case"""
    test_num: int
    input: str
    expected_output: str
    actual_output: str
    passed: bool
    is_hidden: bool = False
    error: Optional[str] = None


class SubmitCodeResponse(BaseModel):
    """Response sau khi nộp bài"""
    submission_id: int
    status: str  # passed, failed, error, timeout
    total_tests: int
    passed_tests: int
    percentage: float
    test_results: List[TestResultItem]  # Chỉ hiển thị test cases công khai
    execution_time_ms: Optional[int] = None


class SubmissionItem(BaseModel):
    """Thông tin bài nộp (cho giáo viên xem)"""
    id: int
    student_name: str
    student_class: str
    student_group: Optional[str]
    status: str
    total_tests: int
    passed_tests: int
    percentage: float
    code: str
    submitted_at: datetime
    execution_time_ms: Optional[int]

    class Config:
        from_attributes = True


class SubmissionsListResponse(BaseModel):
    """Danh sách bài nộp"""
    exercise_title: str
    total_submissions: int
    submissions: List[SubmissionItem]


# ============== Teacher View & Update ==============

class CodeExerciseTeacherView(BaseModel):
    """Thông tin bài tập đầy đủ (cho giáo viên/creator)"""
    title: str
    description: Optional[str]
    language: str
    problem_statement: str
    starter_code: Optional[str]
    test_cases: List[TestCaseInput]
    time_limit_seconds: int


class UpdateCodeExerciseRequest(BaseModel):
    """Request cập nhật bài tập"""
    starter_code: Optional[str] = None
    test_cases: Optional[List[TestCaseInput]] = None


# ============== Code Extraction from KHBD ==============

class ExtractCodeExercisesRequest(BaseModel):
    """Request trích xuất bài tập code từ KHBD"""
    lesson_plan_content: str = Field(..., min_length=1, description="Nội dung KHBD (markdown)")
    lesson_info: Optional[dict] = Field(None, description="Thông tin bài học")
    auto_create: bool = Field(default=False, description="Tự động tạo CodeExercise sau khi trích xuất")
    expires_in_days: int = Field(default=30, ge=1, le=365)


class ExtractedExerciseItem(BaseModel):
    """Bài tập đã trích xuất từ KHBD"""
    title: str
    description: str
    source_activity: str
    language: str = "python"
    starter_code: Optional[str] = None
    test_cases: List[TestCaseInput]
    lesson_info: Optional[dict] = None


class ExtractCodeExercisesResponse(BaseModel):
    """Response trích xuất bài tập code"""
    found: bool
    exercises: List[ExtractedExerciseItem] = []
    reason: Optional[str] = None
    created_exercises: Optional[List[CreateCodeExerciseResponse]] = None


# ============== Hint (Gợi ý khi sai test case) ==============

class FailedTestInfo(BaseModel):
    """Thông tin 1 test case sai"""
    test_num: int
    input: str
    expected_output: str
    actual_output: str
    error: Optional[str] = None


class HintRequest(BaseModel):
    """Request phân tích lỗi tổng hợp"""
    code: str = Field(..., min_length=1, max_length=50000)
    failed_tests: List[FailedTestInfo] = Field(..., min_length=1, max_length=20)


class HintResponse(BaseModel):
    """Response phân tích lỗi"""
    hint: str
