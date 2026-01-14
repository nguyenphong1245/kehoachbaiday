"""
Model cho Giáo án đã lưu - dùng cho việc lưu trữ và fine-tuning
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


class SavedLessonPlan(Base):
    """Lưu trữ giáo án đã soạn và chỉnh sửa"""
    __tablename__ = "saved_lesson_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Thông tin cơ bản
    title = Column(String(500), nullable=False)  # Tên giáo án
    book_type = Column(String(100), nullable=True)  # Loại sách (Cánh diều, KNTT, CTST)
    grade = Column(String(20), nullable=True)  # Lớp (10, 11, 12)
    topic = Column(String(500), nullable=True)  # Chủ đề
    lesson_name = Column(String(500), nullable=True)  # Tên bài học
    lesson_id = Column(String(100), nullable=True)  # ID bài học từ Neo4j
    
    # Nội dung giáo án
    content = Column(Text, nullable=False)  # Nội dung Markdown đầy đủ
    sections = Column(JSON, nullable=True)  # Các section chi tiết (array of objects)
    
    # Metadata cho fine-tuning
    generation_params = Column(JSON, nullable=True)  # Tham số đã dùng để sinh (methods, techniques, activities...)
    original_content = Column(Text, nullable=True)  # Nội dung gốc trước khi chỉnh sửa
    
    # Tracking
    is_printed = Column(Boolean, default=False)  # Đã in chưa
    print_count = Column(Integer, default=0)  # Số lần in
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    
    # Relationships
    user = relationship("User", back_populates="saved_lesson_plans")
    
    def __repr__(self):
        return f"<SavedLessonPlan(id={self.id}, title='{self.title}', user_id={self.user_id})>"
