"""
Models cho bài tập lập trình (Code Exercises)
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class CodeExercise(Base):
    """Bài tập lập trình được chia sẻ cho học sinh"""
    __tablename__ = "code_exercises"

    id = Column(Integer, primary_key=True, index=True)
    share_code = Column(String(8), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(50), default="python", nullable=False)

    # Đề bài và test cases
    problem_statement = Column(Text, nullable=False)  # Đề bài chi tiết
    starter_code = Column(Text, nullable=True)  # Code mẫu ban đầu
    test_cases = Column(JSON, nullable=False)  # [{"input": "...", "expected_output": "...", "is_hidden": false}]

    # Giới hạn
    time_limit_seconds = Column(Integer, default=5)  # Giới hạn thời gian chạy code (giây)
    memory_limit_mb = Column(Integer, default=128)  # Giới hạn bộ nhớ (MB)

    # Thông tin bài học liên kết
    lesson_info = Column(JSON, nullable=True)

    # Metadata
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    creator = relationship("User", back_populates="code_exercises")
    submissions = relationship("CodeSubmission", back_populates="exercise", cascade="all, delete-orphan")


class CodeSubmission(Base):
    """Bài nộp code của học sinh"""
    __tablename__ = "code_submissions"

    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("code_exercises.id", ondelete="CASCADE"), nullable=False)

    # Thông tin học sinh
    student_name = Column(String(200), nullable=False)
    student_class = Column(String(100), nullable=False)
    student_group = Column(String(100), nullable=True)

    # Code và kết quả
    code = Column(Text, nullable=False)
    language = Column(String(50), default="python", nullable=False)

    # Kết quả chấm
    status = Column(String(50), default="pending")  # pending, running, passed, failed, error, timeout
    total_tests = Column(Integer, default=0)
    passed_tests = Column(Integer, default=0)
    test_results = Column(JSON, nullable=True)  # [{"input": "...", "expected": "...", "actual": "...", "passed": true}]
    error_message = Column(Text, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)

    # Metadata
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    exercise = relationship("CodeExercise", back_populates="submissions")
