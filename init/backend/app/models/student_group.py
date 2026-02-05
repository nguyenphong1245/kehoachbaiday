"""
StudentGroup & GroupMember Models - Nhóm học sinh trong lớp
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class StudentGroup(Base):
    __tablename__ = "student_groups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    classroom = relationship("Classroom", back_populates="groups")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (
        UniqueConstraint("group_id", "student_id", name="uq_group_members_group_student"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(Integer, ForeignKey("student_groups.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("class_students.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    group = relationship("StudentGroup", back_populates="members")
    student = relationship("ClassStudent", back_populates="group_memberships")
