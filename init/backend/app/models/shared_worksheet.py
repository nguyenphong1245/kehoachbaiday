"""
SharedWorksheet Model - Phiếu học tập chia sẻ cho học sinh
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class SharedWorksheet(Base):
    __tablename__ = "shared_worksheets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    share_code = Column(String(32), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    lesson_info = Column(JSON, nullable=True)
    questions = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    max_submissions = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="shared_worksheets")
    responses = relationship("WorksheetResponse", back_populates="worksheet", cascade="all, delete-orphan")


class WorksheetResponse(Base):
    __tablename__ = "worksheet_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    worksheet_id = Column(Integer, ForeignKey("shared_worksheets.id", ondelete="CASCADE"), nullable=False)
    student_name = Column(String(255), nullable=False)
    student_class = Column(String(50), nullable=True)
    student_group = Column(String(50), nullable=True)
    answers = Column(JSON, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(50), nullable=True)

    # Relationships
    worksheet = relationship("SharedWorksheet", back_populates="responses")
