"""
LessonPlanComment Model — Nhận xét của GV trên KHBD (kiểu Word/Google Docs).
Mỗi comment gắn với 1 đoạn text đã bôi đen trong KHBD.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class LessonPlanComment(Base):
    __tablename__ = "lesson_plan_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lesson_plan_id = Column(
        Integer,
        ForeignKey("saved_lesson_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Anchor: vị trí comment trong KHBD
    selected_text = Column(Text, nullable=False)  # đoạn text đã bôi đen
    context_before = Column(String(200), nullable=True)  # ~50 ký tự trước vùng chọn
    context_after = Column(String(200), nullable=True)  # ~50 ký tự sau vùng chọn
    section_type = Column(String(50), nullable=True)  # section nào trong KHBD

    # Nội dung nhận xét (10-500 ký tự)
    comment_text = Column(Text, nullable=False)

    # Threading (kiểu Docs/Word): comment gốc + replies
    parent_comment_id = Column(
        Integer,
        ForeignKey("lesson_plan_comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # Resolve thread
    is_resolved = Column(Boolean, nullable=False, server_default="false")
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Liên kết rule đã sinh
    rule_id = Column(Integer, ForeignKey("teaching_rules.id", ondelete="SET NULL"), nullable=True)

    # Trạng thái phân tích AI
    # pending: chờ phân tích | processing: đang chạy | completed | failed | skipped
    analysis_status = Column(String(20), nullable=False, server_default="pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    lesson_plan = relationship("SavedLessonPlan", back_populates="comments")
    teacher = relationship("User", foreign_keys=[teacher_id])
    resolver = relationship("User", foreign_keys=[resolved_by])
    rule = relationship("TeachingRule", back_populates="comments")
    parent_comment = relationship(
        "LessonPlanComment",
        remote_side=[id],
        back_populates="replies",
        foreign_keys=[parent_comment_id],
    )
    replies = relationship(
        "LessonPlanComment",
        back_populates="parent_comment",
        cascade="all, delete-orphan",
    )
