from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: str = Column(String(36), primary_key=True, index=True)
    name: str = Column(String(150), unique=True, nullable=False)
    description: str | None = Column(String(1024), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    documents = relationship("Document", back_populates="category", cascade="all, delete-orphan")
