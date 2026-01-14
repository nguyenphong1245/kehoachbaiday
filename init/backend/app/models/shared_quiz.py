"""
Models cho Quiz chia sẻ (Trắc nghiệm)
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class SharedQuiz(Base):
    """Quiz được chia sẻ cho học sinh làm bài"""
    __tablename__ = "shared_quizzes"

    id = Column(Integer, primary_key=True, index=True)
    share_code = Column(String(8), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)  # Nội dung quiz từ section TRAC_NGHIEM
    questions = Column(JSON, nullable=False)  # List câu hỏi đã parse
    total_questions = Column(Integer, default=0)
    time_limit = Column(Integer, nullable=True)  # Thời gian làm bài (phút), null = không giới hạn
    
    # Metadata
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # Hết hạn chia sẻ
    is_active = Column(Boolean, default=True)
    
    # Settings
    show_correct_answers = Column(Boolean, default=False)  # Hiển thị đáp án sau khi nộp
    allow_multiple_attempts = Column(Boolean, default=False)  # Cho phép làm lại
    
    # Relationships
    creator = relationship("User", back_populates="created_quizzes")
    responses = relationship("QuizResponse", back_populates="quiz", cascade="all, delete-orphan")


class QuizResponse(Base):
    """Bài làm của học sinh"""
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("shared_quizzes.id", ondelete="CASCADE"), nullable=False)
    
    # Thông tin học sinh
    student_name = Column(String(200), nullable=False)
    student_class = Column(String(100), nullable=False)
    student_email = Column(String(255), nullable=True)
    
    # Đáp án
    answers = Column(JSON, nullable=False)  # {"question_id": "A", ...}
    
    # Kết quả
    score = Column(Integer, default=0)  # Điểm số
    total_correct = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    
    # Metadata
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    time_spent = Column(Integer, nullable=True)  # Thời gian làm bài (giây)
    
    # Relationship
    quiz = relationship("SharedQuiz", back_populates="responses")
