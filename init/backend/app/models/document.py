from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id: str = Column(String(36), primary_key=True, index=True)
    title: str | None = Column(String(255), nullable=True)
    content: str | None = Column(Text, nullable=True)
    category_id: str | None = Column(String(36), ForeignKey("categories.id"), nullable=True, index=True)
    embedding: str | None = Column(Text, nullable=True)  # JSON string of embedding vector
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    category = relationship("Category", back_populates="documents")
