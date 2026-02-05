"""
GroupWorkSession, IndividualSubmission, GroupDiscussion Models
Phiên làm bài nhóm/cá nhân
"""
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class GroupWorkSession(Base):
    __tablename__ = "group_work_sessions"
    __table_args__ = (
        UniqueConstraint("assignment_id", "group_id", name="uq_work_session_assignment_group"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    assignment_id = Column(Integer, ForeignKey("class_assignments.id", ondelete="CASCADE"), nullable=False)
    group_id = Column(Integer, ForeignKey("student_groups.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), server_default="in_progress")  # 'in_progress', 'submitted', 'reviewed'
    answers = Column(JSON, server_default="{}")
    task_assignments = Column(JSON, server_default="{}")  # {student_id: [question_ids]}
    leader_id = Column(Integer, ForeignKey("class_students.id", ondelete="SET NULL"), nullable=True)
    leader_votes = Column(JSON, server_default="{}")  # {voter_id: candidate_id}
    member_evaluations = Column(JSON, nullable=True)  # {evaluator_student_id: [{student_id, rating, comment}]}
    member_grades = Column(JSON, nullable=True)  # {student_id: {score: float, comment: str}}
    teacher_score = Column(Float, nullable=True)  # Overall group score (optional)
    teacher_comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    assignment = relationship("ClassAssignment", back_populates="work_sessions")
    group = relationship("StudentGroup")
    leader = relationship("ClassStudent")
    discussions = relationship("GroupDiscussion", back_populates="work_session", cascade="all, delete-orphan")


class IndividualSubmission(Base):
    __tablename__ = "individual_submissions"
    __table_args__ = (
        UniqueConstraint("assignment_id", "student_id", name="uq_individual_submission_assignment_student"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    assignment_id = Column(Integer, ForeignKey("class_assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("class_students.id", ondelete="CASCADE"), nullable=False)
    answers = Column(JSON, server_default="{}")
    status = Column(String(20), server_default="in_progress")  # 'in_progress', 'submitted', 'reviewed'
    teacher_score = Column(Float, nullable=True)
    teacher_comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    assignment = relationship("ClassAssignment", back_populates="individual_submissions")
    student = relationship("ClassStudent")


class GroupDiscussion(Base):
    __tablename__ = "group_discussions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    work_session_id = Column(Integer, ForeignKey("group_work_sessions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    work_session = relationship("GroupWorkSession", back_populates="discussions")
    user = relationship("User")
