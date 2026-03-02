"""
GuideCard Model - Content cards for the User Guide page
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class GuideCard(Base):
    __tablename__ = "guide_cards"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    card_key: str = Column(String(50), unique=True, nullable=False)
    icon_name: str = Column(String(50), nullable=False)
    color: str = Column(String(200), nullable=False)
    icon_color: str = Column(String(100), nullable=False)
    title: str = Column(String(200), nullable=False)
    description: str = Column(String(500), nullable=False)
    content_html: str = Column(Text, nullable=False)
    video_url: str | None = Column(String(500), nullable=True)
    sort_order: int = Column(Integer, nullable=False, default=0)
    is_active: bool = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
