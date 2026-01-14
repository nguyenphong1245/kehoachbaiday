"""
Model cho lesson_contents table - Lưu nội dung markdown của bài học
Liên kết với Neo4j qua neo4j_lesson_id

Flow:
1. Người dùng chọn bài học từ dropdown (query Neo4j)
2. Neo4j trả về lesson_id (VD: KNTT_10_BAI_01)
3. Dùng lesson_id query SQLite lấy nội dung markdown
4. Truyền markdown content vào Gemini để generate giáo án
"""
from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base


class LessonContent(Base):
    """
    Table lưu trữ nội dung bài học từ file markdown.
    Liên kết với Neo4j thông qua neo4j_lesson_id.
    
    neo4j_lesson_id format: {BOOK_CODE}_{GRADE}_BAI_{NUM}
    VD: KNTT_10_BAI_01, CD_11_BAI_05
    """
    __tablename__ = "lesson_contents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Link to Neo4j lesson node - QUAN TRỌNG: Dùng để query nội dung
    neo4j_lesson_id = Column(String(100), unique=True, nullable=False, index=True,
                             comment="ID liên kết với BaiHoc.id trong Neo4j (VD: KNTT_10_BAI_01)")
    
    # Lesson metadata
    lesson_name = Column(String(255), nullable=True, comment="Tên bài học")
    
    # Content - Nội dung markdown đầy đủ
    content = Column(Text, nullable=True, comment="Nội dung markdown của bài học")

    def __repr__(self):
        return f"<LessonContent(id={self.id}, neo4j_id={self.neo4j_lesson_id}, name={self.lesson_name})>"
