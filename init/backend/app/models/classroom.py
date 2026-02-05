"""
Classroom Model - Lớp học do giáo viên quản lý
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    grade = Column(String(20), nullable=True)
    school_year = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    teacher = relationship("User", back_populates="classrooms")
    students = relationship("ClassStudent", back_populates="classroom", cascade="all, delete-orphan")
    groups = relationship("StudentGroup", back_populates="classroom", cascade="all, delete-orphan")
    assignments = relationship("ClassAssignment", back_populates="classroom", cascade="all, delete-orphan")
    materials = relationship("ClassroomMaterial", back_populates="classroom", cascade="all, delete-orphan")
