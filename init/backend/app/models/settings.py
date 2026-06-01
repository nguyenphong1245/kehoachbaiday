from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    marketing_emails_enabled: bool = Column(Boolean, nullable=False, server_default="1")
    push_notifications_enabled: bool = Column(Boolean, nullable=False, server_default="1")
    timezone: str | None = Column(String(50), nullable=True)

    # Teaching preferences
    teaching_tools: list | None = Column(JSON, nullable=True)
    custom_tools: list | None = Column(JSON, nullable=True)
    teaching_style: str | None = Column(Text, nullable=True)

    # Default lesson plan identity info
    school_name: str | None = Column(String(255), nullable=True)
    department_name: str | None = Column(String(255), nullable=True)
    teacher_name: str | None = Column(String(255), nullable=True)

    user = relationship("User", back_populates="settings")
