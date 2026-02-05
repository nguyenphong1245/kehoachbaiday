"""
ClassAssignment Model - Bài giao cho lớp
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class ClassAssignment(Base):
    __tablename__ = "class_assignments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)

    # Polymorphic content reference
    content_type = Column(String(20), nullable=False)  # 'worksheet', 'quiz', 'code_exercise'
    content_id = Column(Integer, nullable=False)

    # Lesson context
    lesson_plan_id = Column(Integer, ForeignKey("saved_lesson_plans.id", ondelete="SET NULL"), nullable=True)
    lesson_info = Column(JSON, nullable=True)  # {lesson_name, activity_name, activity_type}

    # Assignment settings
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    work_type = Column(String(20), nullable=False, server_default="individual")  # 'individual' | 'group'
    is_active = Column(Boolean, default=True, nullable=False)
    start_at = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    auto_peer_review = Column(Boolean, default=False, nullable=False, server_default="false")

    # Peer review status and times
    peer_review_status = Column(String(20), nullable=True)  # None, 'active', 'completed'
    peer_review_start_time = Column(DateTime(timezone=True), nullable=True)
    peer_review_end_time = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    classroom = relationship("Classroom", back_populates="assignments")
    lesson_plan = relationship("SavedLessonPlan")
    work_sessions = relationship("GroupWorkSession", back_populates="assignment", cascade="all, delete-orphan")
    individual_submissions = relationship("IndividualSubmission", back_populates="assignment", cascade="all, delete-orphan")
    peer_review_round = relationship("PeerReviewRound", back_populates="assignment", uselist=False, cascade="all, delete-orphan")
