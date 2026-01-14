from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme: str = Column(String(20), nullable=False, server_default="system")
    language: str = Column(String(10), nullable=False, server_default="en")
    marketing_emails_enabled: bool = Column(Boolean, nullable=False, server_default="1")
    push_notifications_enabled: bool = Column(Boolean, nullable=False, server_default="1")
    timezone: str | None = Column(String(50), nullable=True)

    user = relationship("User", back_populates="settings")
