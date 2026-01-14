"""
Schemas cho Quiz chia sẻ
"""
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    """Câu hỏi trắc nghiệm"""
    id: str
    question: str
    options: Dict[str, str]  # {"A": "Đáp án A", "B": "Đáp án B", ...}
    correct_answer: str  # "A", "B", "C", "D"


class QuizQuestionInput(BaseModel):
    """Câu hỏi trắc nghiệm từ LLM JSON"""
    question: str
    A: str
    B: str
    C: str
    D: str
    answer: str


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

    class Config:
        from_attributes = True


class QuizPublicResponse(BaseModel):
    """Thông tin quiz công khai (cho học sinh)"""
    title: str
    description: Optional[str]
    total_questions: int
    time_limit: Optional[int]
    questions: List[QuizQuestion]  # Không bao gồm đáp án đúng


class SubmitQuizRequest(BaseModel):
    """Request nộp bài quiz"""
    student_name: str = Field(..., min_length=1, max_length=200)
    student_class: str = Field(..., min_length=1, max_length=100)
    student_email: Optional[str] = None
    answers: Dict[str, str]  # {"question_1": "A", "question_2": "B", ...}
    time_spent: Optional[int] = None  # Giây


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
