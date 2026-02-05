from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.association import user_roles_table


class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True, index=True)
    email: str = Column(String(320), unique=True, index=True, nullable=False)
    hashed_password: str = Column("password", String(255), nullable=False)
    is_active: bool = Column(Boolean, nullable=False, server_default="1")
    is_verified: bool = Column(Boolean, nullable=False, server_default="0")
    token_balance: int = Column(Integer, nullable=False, server_default="20000")
    tokens_used: int = Column(Integer, nullable=False, server_default="0")
    failed_login_attempts: int = Column(Integer, nullable=False, server_default="0")
    locked_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    roles = relationship("Role", secondary=user_roles_table, back_populates="users")
    profile = relationship(
        "UserProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
        single_parent=True,
    )
    settings = relationship(
        "UserSettings",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
        single_parent=True,
    )
    verification_tokens = relationship(
        "EmailVerificationToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    password_reset_tokens = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    chat_conversations = relationship(
        "ChatConversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    saved_lesson_plans = relationship(
        "SavedLessonPlan",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    shared_worksheets = relationship(
        "SharedWorksheet",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    created_quizzes = relationship(
        "SharedQuiz",
        back_populates="creator",
        cascade="all, delete-orphan",
    )
    code_exercises = relationship(
        "CodeExercise",
        back_populates="creator",
        cascade="all, delete-orphan",
    )
    # Classroom relationships
    classrooms = relationship(
        "Classroom",
        back_populates="teacher",
        cascade="all, delete-orphan",
    )
    class_enrollments = relationship(
        "ClassStudent",
        back_populates="user",
        cascade="all, delete-orphan",
    )
