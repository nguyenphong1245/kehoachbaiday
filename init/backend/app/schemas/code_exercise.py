"""
Schemas cho Code Exercises - Bài tập Ghép thẻ code và Viết code
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============== PARSONS (GHÉP THẺ CODE) ==============

class ParsonsBlock(BaseModel):
    """Một block code trong bài ghép thẻ"""
    id: str = Field(..., description="ID duy nhất của block")
    content: str = Field(..., description="Nội dung code")
    indent: int = Field(0, description="Mức thụt đầu dòng (0, 1, 2...)")


class ParsonsData(BaseModel):
    """Dữ liệu cho bài tập Ghép thẻ code"""
    blocks: List[ParsonsBlock] = Field(..., description="Các block code bị xáo trộn")
    correct_order: List[str] = Field(..., description="Thứ tự đúng của các block ID")
    distractors: Optional[List[ParsonsBlock]] = Field(None, description="Các block nhiễu")


# ============== CODING (VIẾT CODE) ==============

class TestCase(BaseModel):
    """Test case cho bài viết code"""
    input: str = Field(..., description="Input của test case")
    expected: str = Field(..., description="Output mong đợi")
    hidden: bool = Field(False, description="Ẩn test case với học sinh")


class CodingData(BaseModel):
    """Dữ liệu cho bài tập Viết code"""
    starter_code: str = Field(..., description="Code khung ban đầu")
    solution_code: str = Field(..., description="Code đáp án (ẩn)")
    test_code: str = Field(..., description="Code để kiểm tra (assert statements)")
    test_cases: List[TestCase] = Field(..., description="Danh sách test cases")
    hints: Optional[List[str]] = Field(None, description="Gợi ý cho học sinh")


# ============== CREATE/SHARE CODE EXERCISE ==============

class CreateCodeExerciseRequest(BaseModel):
    """Request tạo/share bài tập code"""
    exercise_type: str = Field(..., description="Loại: 'parsons' hoặc 'coding'")
    title: str = Field(..., description="Tiêu đề bài tập")
    description: str = Field(..., description="Mô tả/đề bài")
    language: str = Field("python", description="Ngôn ngữ")
    difficulty: str = Field("medium", description="Độ khó: easy, medium, hard")
    
    # Dữ liệu bài tập (một trong hai)
    parsons_data: Optional[ParsonsData] = Field(None, description="Dữ liệu Parsons")
    coding_data: Optional[CodingData] = Field(None, description="Dữ liệu Coding")
    
    # Metadata
    lesson_plan_id: Optional[int] = Field(None, description="ID kế hoạch bài dạy liên quan")
    expires_in_days: int = Field(7, description="Số ngày hết hạn")


class CreateCodeExerciseResponse(BaseModel):
    """Response sau khi tạo share"""
    exercise_id: int
    share_code: str
    share_url: str
    title: str
    exercise_type: str
    expires_at: Optional[datetime] = None


# ============== GET CODE EXERCISE (PUBLIC) ==============

class PublicCodeExerciseResponse(BaseModel):
    """Response bài tập code cho học sinh (Public)"""
    share_code: str
    exercise_type: str
    title: str
    description: str
    language: str
    difficulty: str
    
    # Dữ liệu bài tập (đã lọc bỏ đáp án)
    parsons_data: Optional[ParsonsData] = None  # blocks đã xáo trộn, correct_order ẨN
    coding_data: Optional[dict] = None  # Chỉ có starter_code, test_cases (không hidden), hints
    
    # Metadata
    creator_name: Optional[str] = None
    created_at: datetime


class PublicParsonsData(BaseModel):
    """Dữ liệu Parsons cho học sinh (đã ẩn đáp án)"""
    blocks: List[ParsonsBlock]  # Đã xáo trộn + bao gồm distractors
    # KHÔNG có correct_order


class PublicCodingData(BaseModel):
    """Dữ liệu Coding cho học sinh (đã ẩn đáp án)"""
    starter_code: str
    test_cases: List[TestCase]  # Chỉ những cái hidden=False
    hints: Optional[List[str]] = None
    # KHÔNG có solution_code, test_code


# ============== SUBMIT ANSWER ==============

class SubmitParsonsRequest(BaseModel):
    """Request nộp bài Parsons"""
    student_name: str = Field(..., description="Tên học sinh")
    submitted_order: List[str] = Field(..., description="Thứ tự block ID mà học sinh sắp xếp")


class SubmitCodingRequest(BaseModel):
    """Request nộp bài Coding"""
    student_name: str = Field(..., description="Tên học sinh")
    submitted_code: str = Field(..., description="Code học sinh viết")


class TestResult(BaseModel):
    """Kết quả một test case"""
    test_id: int
    input: str
    expected: str
    actual: Optional[str] = None
    passed: bool
    error: Optional[str] = None
    hidden: bool = False


class SubmitCodeExerciseResponse(BaseModel):
    """Response sau khi nộp bài"""
    submission_id: int
    is_correct: bool
    score: int  # 0-100
    total_tests: Optional[int] = None
    passed_tests: Optional[int] = None
    test_results: Optional[List[TestResult]] = None
    feedback: Optional[str] = None
    submitted_at: datetime


# ============== TEACHER VIEW SUBMISSIONS ==============

class SubmissionListItem(BaseModel):
    """Item trong danh sách bài nộp"""
    id: int
    student_name: str
    score: int
    is_correct: bool
    submitted_at: datetime


class SubmissionListResponse(BaseModel):
    """Danh sách bài nộp của một bài tập"""
    exercise_title: str
    exercise_type: str
    submissions: List[SubmissionListItem]
    total: int
    average_score: float


class SubmissionDetail(BaseModel):
    """Chi tiết một bài nộp"""
    id: int
    student_name: str
    submitted_code: Optional[str] = None  # Cho coding
    submitted_order: Optional[List[str]] = None  # Cho parsons
    score: int
    is_correct: bool
    feedback: Optional[str] = None
    test_results: Optional[List[TestResult]] = None
    submitted_at: datetime


# ============== TEACHER EXERCISE MANAGEMENT ==============

class MyCodeExerciseItem(BaseModel):
    """Item trong danh sách bài tập của giáo viên"""
    id: int
    share_code: str
    exercise_type: str
    title: str
    difficulty: str
    submission_count: int
    average_score: Optional[float] = None
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None


class MyCodeExercisesResponse(BaseModel):
    """Danh sách bài tập của giáo viên"""
    exercises: List[MyCodeExerciseItem]
    total: int


# ============== GENERATE CODE EXERCISE (AI) ==============

class GenerateCodeExerciseRequest(BaseModel):
    """Request tạo bài tập code bằng AI từ nội dung section"""
    exercise_type: str = Field(..., description="Loại: 'parsons' hoặc 'coding'")
    section_content: str = Field(..., description="Nội dung section để tạo bài tập")
    section_title: str = Field("", description="Tiêu đề section")
    lesson_name: str = Field("", description="Tên bài học")
    difficulty: str = Field("medium", description="Độ khó: easy, medium, hard")
    language: str = Field("python", description="Ngôn ngữ lập trình")


class GeneratedParsonsExercise(BaseModel):
    """Bài tập Parsons được tạo bởi AI"""
    title: str
    description: str
    blocks: List[ParsonsBlock]
    correct_order: List[str]
    distractors: Optional[List[ParsonsBlock]] = None


class GeneratedCodingExercise(BaseModel):
    """Bài tập Coding được tạo bởi AI"""
    title: str
    description: str
    starter_code: str
    solution_code: str
    test_code: str
    test_cases: List[TestCase]
    hints: Optional[List[str]] = None


class GenerateCodeExerciseResponse(BaseModel):
    """Response chứa bài tập được tạo"""
    exercise_type: str
    parsons_exercise: Optional[GeneratedParsonsExercise] = None
    coding_exercise: Optional[GeneratedCodingExercise] = None
