"""
Schemas cho Quiz chia sẻ
"""
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    """Câu hỏi trắc nghiệm - chỉ hỗ trợ chọn 1 đáp án đúng"""
    id: str
    question: str
    type: str = "multiple_choice"  # Luôn là multiple_choice
    options: Dict[str, str]  # {A: "...", B: "...", C: "...", D: "..."}
    correct_answer: str  # 1 chữ cái: A, B, C, hoặc D


class QuizQuestionInput(BaseModel):
    """Câu hỏi trắc nghiệm từ LLM JSON"""
    question: str
    A: str
    B: str
    C: str
    D: str
    answer: str  # Chỉ 1 chữ cái: "A", "B", "C", hoặc "D"


class CreateSharedQuizRequest(BaseModel):
    """Request tạo quiz chia sẻ"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    content: Optional[str] = None  # Optional - fallback nếu không có questions
    questions: Optional[List[QuizQuestionInput]] = None  # Trực tiếp từ LLM JSON
    time_limit: Optional[int] = None  # Phút
    expires_in_days: int = Field(default=30, ge=1, le=365)
    show_correct_answers: bool = False
    allow_multiple_attempts: bool = False
    lesson_info: Optional[Dict] = None  # Thông tin bài học liên kết


class UpdateQuizRequest(BaseModel):
    """Request cập nhật quiz"""
    title: Optional[str] = None
    questions: Optional[List[QuizQuestion]] = None
    time_limit: Optional[int] = None
    show_correct_answers: Optional[bool] = None


class CreateSharedQuizResponse(BaseModel):
    """Response sau khi tạo quiz"""
    quiz_id: int
    share_code: str
    share_url: str
    title: str
    total_questions: int
    expires_at: datetime


class SharedQuizResponse(BaseModel):
    """Thông tin quiz (cho giáo viên)"""
    id: int
    share_code: str
    title: str
    description: Optional[str]
    total_questions: int
    time_limit: Optional[int]
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    show_correct_answers: bool
    allow_multiple_attempts: bool
    response_count: int
    lesson_info: Optional[Dict] = None

    class Config:
        from_attributes = True


class QuizPublicResponse(BaseModel):
    """Thông tin quiz công khai (cho học sinh)"""
    title: str
    description: Optional[str]
    total_questions: int
    time_limit: Optional[int]
    questions: List[QuizQuestion]  # Không bao gồm đáp án đúng


class StartSessionRequest(BaseModel):
    """Request để bắt đầu phiên làm bài"""
    student_name: str = Field(..., min_length=1, max_length=200)
    student_class: str = Field(..., min_length=1, max_length=100)


class StartSessionResponse(BaseModel):
    """Response trả về session token"""
    session_token: str


class SubmitQuizRequest(BaseModel):
    """Request nộp bài quiz"""
    student_name: str = Field(..., min_length=1, max_length=200)
    student_class: str = Field(..., min_length=1, max_length=100)
    student_group: Optional[str] = Field(None, max_length=100, description="Nhóm (nếu có)")
    student_email: Optional[str] = None
    answers: Dict[str, str]  # {"question_1": "A", "question_2": "B", ...}
    time_spent: Optional[int] = None  # Giây
    session_token: str = Field(..., description="Token phiên làm bài từ start-session")


class SubmitQuizResponse(BaseModel):
    """Response sau khi nộp bài"""
    response_id: int
    score: int
    total_correct: int
    total_questions: int
    percentage: float
    correct_answers: Optional[Dict[str, str]] = None  # Chỉ hiển thị nếu cho phép


class QuizResponseItem(BaseModel):
    """Thông tin bài làm của học sinh"""
    id: int
    student_name: str
    student_class: str
    student_email: Optional[str]
    score: int
    total_correct: int
    total_questions: int
    percentage: float
    submitted_at: datetime
    time_spent: Optional[int]

    class Config:
        from_attributes = True


class QuizResponsesListResponse(BaseModel):
    """Danh sách bài làm của học sinh"""
    quiz_title: str
    total_responses: int
    responses: List[QuizResponseItem]


class QuizStatisticsResponse(BaseModel):
    """Thống kê quiz"""
    total_responses: int
    average_score: float
    highest_score: float
    lowest_score: float
    average_time_spent: Optional[int] = None
    score_distribution: Dict[str, int]  # {"0-20": 1, "21-40": 3, ...}
