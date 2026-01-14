from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name: str | None = Column(String(100), nullable=True)
    last_name: str | None = Column(String(100), nullable=True)
    bio: str | None = Column(Text, nullable=True)
    avatar_url: str | None = Column(String(255), nullable=True)

    user = relationship("User", back_populates="profile")
