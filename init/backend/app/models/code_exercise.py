"""
Model cho Code Exercise - Bài tập Ghép thẻ code và Viết code
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class SharedCodeExercise(Base):
    """Bài tập code đã share"""
    __tablename__ = "shared_code_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    share_code = Column(String(8), unique=True, index=True, nullable=False)
    
    # Thông tin bài tập
    exercise_type = Column(String(20), nullable=False)  # "parsons" hoặc "coding"
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(20), default="python")
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    
    # Dữ liệu bài tập (JSON)
    # Parsons: { blocks: [], correct_order: [], distractors: [] }
    # Coding: { starter_code, solution_code, test_code, test_cases: [], hints: [] }
    exercise_data = Column(JSON, nullable=False)
    
    # Liên kết
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_plan_id = Column(Integer, ForeignKey("saved_lesson_plans.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    creator = relationship("User", back_populates="code_exercises")
    submissions = relationship("CodeExerciseSubmission", back_populates="exercise", cascade="all, delete-orphan")


class CodeExerciseSubmission(Base):
    """Bài nộp của học sinh"""
    __tablename__ = "code_exercise_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("shared_code_exercises.id"), nullable=False)
    
    # Thông tin học sinh (không cần đăng nhập)
    student_name = Column(String(200), nullable=False)
    
    # Bài làm
    submitted_code = Column(Text, nullable=True)  # Cho coding
    submitted_order = Column(JSON, nullable=True)  # Cho parsons: ["b1", "b2", "b3"]
    
    # Kết quả
    score = Column(Integer, default=0)  # 0-100
    is_correct = Column(Boolean, default=False)
    test_results = Column(JSON, nullable=True)  # Chi tiết kết quả từng test
    feedback = Column(Text, nullable=True)  # Feedback từ LLM
    
    # Metadata
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    execution_time_ms = Column(Integer, nullable=True)
    
    # Relationship
    exercise = relationship("SharedCodeExercise", back_populates="submissions")
