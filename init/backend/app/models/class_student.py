"""
ClassStudent Model - Học sinh thuộc lớp học
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class ClassStudent(Base):
    __tablename__ = "class_students"
    __table_args__ = (
        UniqueConstraint("classroom_id", "user_id", name="uq_class_students_classroom_user"),
        UniqueConstraint("classroom_id", "student_code", name="uq_class_students_classroom_code"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_code = Column(String(50), nullable=True)
    student_number = Column(Integer, nullable=True)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    classroom = relationship("Classroom", back_populates="students")
    user = relationship("User", back_populates="class_enrollments")
    group_memberships = relationship("GroupMember", back_populates="student", cascade="all, delete-orphan")
