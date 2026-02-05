from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id: int = Column(Integer, primary_key=True, index=True)
    token: str = Column(String(128), unique=True, nullable=False, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    expires_at: datetime = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    attempts: int = Column(Integer, nullable=False, server_default="0")

    user = relationship("User", back_populates="verification_tokens")
