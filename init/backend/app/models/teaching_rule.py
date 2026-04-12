"""
TeachingRule Model — Quy tắc dạy học sinh từ nhận xét GV.
TEACHER_GENERAL: áp dụng mọi bài.
TEACHER_LESSON: chỉ áp dụng cho 1 bài cụ thể (lesson_id).
"""
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class TeachingRule(Base):
    __tablename__ = "teaching_rules"
    __table_args__ = (
        CheckConstraint(
            "(rule_type = 'TEACHER_LESSON' AND lesson_id IS NOT NULL) OR "
            "(rule_type = 'TEACHER_GENERAL' AND lesson_id IS NULL)",
            name="ck_teaching_rules_type_scope",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_type = Column(String(20), nullable=False)  # 'TEACHER_GENERAL' | 'TEACHER_LESSON'
    lesson_id = Column(String(100), nullable=True)  # bắt buộc khi TEACHER_LESSON
    source_plan_id = Column(Integer, ForeignKey("saved_lesson_plans.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)  # nội dung rule, ≤ 150 ký tự
    is_active = Column(Boolean, default=True, nullable=False, server_default="true")
    merged_from = Column(JSON, nullable=True)  # [old_rule_ids] nếu là kết quả nén

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    teacher = relationship("User")
    source_plan = relationship("SavedLessonPlan")
    comments = relationship("LessonPlanComment", back_populates="rule")
