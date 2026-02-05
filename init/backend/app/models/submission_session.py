"""
Submission Session model - prevents student identity spoofing.
When a student starts an assignment, a session token is created and tied
to their name, class, and the specific share_code. The token must be
presented when submitting, ensuring the submitter is the same person
who started the session.
"""
import uuid
from datetime import datetime, timedelta

from sqlalchemy import Column, Integer, String, DateTime, Index
from app.db.base import Base


class SubmissionSession(Base):
    __tablename__ = "submission_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_token = Column(String(64), unique=True, nullable=False, index=True, default=lambda: uuid.uuid4().hex)
    share_code = Column(String(50), nullable=False)
    resource_type = Column(String(20), nullable=False)  # "quiz", "worksheet", "code_exercise"
    student_name = Column(String(200), nullable=False)
    student_class = Column(String(100), nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))

    __table_args__ = (
        Index("ix_submission_session_lookup", "share_code", "resource_type", "student_name", "student_class"),
    )
