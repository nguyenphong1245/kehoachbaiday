from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.db.base import Base


class AdminAIModelSetting(Base):
    __tablename__ = "admin_ai_model_settings"

    id: int = Column(Integer, primary_key=True, index=True)
    feature_key: str = Column(String(100), unique=True, nullable=False, index=True)
    model_name: str = Column(String(64), nullable=False)
    provider: str = Column(String(20), nullable=False, server_default="gemini")
    updated_by_admin_id: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
