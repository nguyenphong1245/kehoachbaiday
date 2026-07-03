from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, func

from app.db.base import Base


class FeatureFlag(Base):
    """Bảng cờ tính năng dùng chung toàn hệ thống (không riêng KG-LPV)."""

    __tablename__ = "feature_flags"

    key: str = Column(String(50), primary_key=True)
    enabled: bool = Column(Boolean, nullable=False, default=False, server_default="false")
    config = Column(JSON, nullable=True)
    updated_by: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
