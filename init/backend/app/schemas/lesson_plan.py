from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum

class QuestionTypeEnum(str, Enum):
    LESSON_PLAN = "lesson_plan"  
    OTHER = "other"  

class LessonPlanQueryFormat(BaseModel):
    lop: Optional[str] = Field(None)
    bai_hoc: Optional[str] = Field(None)

class QuestionClassificationRequest(BaseModel):
    question: str = Field(..., min_length=1)
    
class QuestionClassificationResponse(BaseModel):
    is_lesson_plan: bool = Field(...)
    original_question: str = Field(...)
    formatted_query: Optional[LessonPlanQueryFormat] = Field(None)
    confidence: float = Field(..., ge=0, le=1)

class GraphQueryRequest(BaseModel):
    formatted_query: LessonPlanQueryFormat = Field(...)
    limit: int = Field(3, ge=1, le=100)

class LessonPlanItem(BaseModel):
    bai_hoc_id: str = Field(..., description="ID của bài học")
    lop: Optional[str] = Field(None)
    bai_hoc: Optional[str] = Field(None)
    loai: Optional[str] = Field(None, description="Loại bài học (nếu có trong graph)")
    noi_dung: Optional[str] = Field(None, description="Nội dung bài học (truy xuất từ Neo4j)")
    chu_de: Optional[str] = Field(None)
    loai_sach: Optional[str] = Field(None)
    nang_luc_chinh: Optional[List[str]] = Field(None)  # Changed from nang_luc
    muc_tieu: Optional[List[str]] = Field(None)
    dinh_huong: Optional[List[str]] = Field(None)
    chi_muc: Optional[List[str]] = Field(None)  # Changed to List[str] for simplicity

class GraphQueryResponse(BaseModel):
    results: List[LessonPlanItem] = Field(...)
    total: int = Field(...)
    query_params: LessonPlanQueryFormat = Field(...)

class GenerateLessonPlanRequest(BaseModel):
    user_question: str = Field(..., description="Câu hỏi/yêu cầu ban đầu của người dùng")
    formatted_query: LessonPlanQueryFormat = Field(..., description="Query đã được format để tìm bài học")
    limit: int = Field(1, ge=1, le=5, description="Số lượng bài học tối đa để tạo kế hoạch")

class GenerateLessonPlanResponse(BaseModel):
    lesson_plan: str = Field(..., description="Kế hoạch bài dạy đã được tạo")
    lesson_used: LessonPlanItem = Field(..., description="Thông tin bài học được sử dụng")
    original_question: str = Field(..., description="Câu hỏi gốc của người dùng")
