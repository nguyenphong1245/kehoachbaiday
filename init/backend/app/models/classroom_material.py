"""
ClassroomMaterial Model - Học liệu đã chuyển vào lớp (staging trước khi giao bài)
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class ClassroomMaterial(Base):
    __tablename__ = "classroom_materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)

    # Polymorphic content reference (same pattern as ClassAssignment)
    content_type = Column(String(20), nullable=False)  # 'worksheet', 'quiz', 'code_exercise'
    content_id = Column(Integer, nullable=False)

    title = Column(String(500), nullable=False)
    lesson_info = Column(JSON, nullable=True)  # {lesson_name, grade, book_type, topic}

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Prevent duplicate material in same class
    __table_args__ = (
        UniqueConstraint("classroom_id", "content_type", "content_id", name="uq_classroom_material"),
    )

    # Relationships
    classroom = relationship("Classroom", back_populates="materials")
