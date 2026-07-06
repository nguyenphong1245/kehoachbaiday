from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from app.db.base import Base


class AiProviderCredential(Base):
    __tablename__ = "ai_provider_credentials"

    provider: str = Column(String(20), primary_key=True)  # gemini | openai | deepseek
    api_key: str | None = Column(Text, nullable=True)
    base_url: str | None = Column(String(255), nullable=True)
    updated_by_admin_id: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
