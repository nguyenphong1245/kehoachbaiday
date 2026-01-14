"""
Schemas cho Phiếu học tập chia sẻ
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ============== REQUEST SCHEMAS ==============

class CreateSharedWorksheetRequest(BaseModel):
    """Request tạo phiếu học tập chia sẻ"""
    title: str = Field(..., description="Tiêu đề phiếu học tập")
    content: str = Field(..., description="Nội dung markdown của phiếu")
    lesson_info: Optional[Dict[str, str]] = Field(None, description="Thông tin bài học")
    expires_hours: Optional[int] = Field(None, description="Số giờ hết hạn (None = không hết hạn)")
    max_submissions: Optional[int] = Field(None, description="Số lượt submit tối đa")


class SubmitWorksheetRequest(BaseModel):
    """Request học sinh submit câu trả lời"""
    student_name: str = Field(..., description="Họ tên học sinh")
    student_class: Optional[str] = Field(None, description="Lớp")
    answers: Dict[str, str] = Field(..., description="Câu trả lời theo format {question_id: answer}")


# ============== RESPONSE SCHEMAS ==============

class SharedWorksheetResponse(BaseModel):
    """Response thông tin phiếu học tập đã chia sẻ"""
    id: int
    share_code: str
    share_url: str
    title: str
    is_active: bool
    expires_at: Optional[datetime]
    max_submissions: Optional[int]
    response_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class WorksheetPublicResponse(BaseModel):
    """Response phiếu học tập cho học sinh (public)"""
    title: str
    content: str
    lesson_info: Optional[Dict[str, str]]
    questions: Optional[List[Dict[str, Any]]]
    is_active: bool
    teacher_name: Optional[str] = None


class WorksheetResponseItem(BaseModel):
    """Một câu trả lời của học sinh"""
    id: int
    student_name: str
    student_class: Optional[str]
    answers: Dict[str, str]
    submitted_at: datetime

    class Config:
        from_attributes = True


class WorksheetResponsesListResponse(BaseModel):
    """Danh sách câu trả lời của học sinh"""
    worksheet_id: int
    title: str
    total_responses: int
    responses: List[WorksheetResponseItem]


class CreateSharedWorksheetResponse(BaseModel):
    """Response sau khi tạo phiếu chia sẻ"""
    id: int
    share_code: str
    share_url: str
    title: str
    message: str


class SubmitWorksheetResponse(BaseModel):
    """Response sau khi học sinh submit"""
    success: bool
    message: str


class SharedWorksheetListResponse(BaseModel):
    """Danh sách phiếu học tập đã chia sẻ"""
    worksheets: List[SharedWorksheetResponse]
    total: int
