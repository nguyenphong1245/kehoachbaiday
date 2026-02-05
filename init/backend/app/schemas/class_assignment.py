"""
Schemas cho Giao bài cho lớp
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class AssignmentCreate(BaseModel):
    classroom_id: int
    content_type: str = Field(..., description="'worksheet', 'quiz', 'code_exercise'")
    content_id: int
    title: str = Field(..., max_length=500)
    description: Optional[str] = None
    work_type: str = Field("individual", description="'individual' hoặc 'group'")
    lesson_plan_id: Optional[int] = None
    lesson_info: Optional[Dict[str, Any]] = None
    due_date: Optional[str] = None  # ISO format
    start_at: Optional[str] = None  # ISO format
    auto_peer_review: bool = False
    peer_review_start_time: Optional[str] = None  # ISO format
    peer_review_end_time: Optional[str] = None  # ISO format


class AssignmentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    work_type: Optional[str] = None
    is_active: Optional[bool] = None
    due_date: Optional[str] = None
    start_at: Optional[str] = None
    auto_peer_review: Optional[bool] = None
    peer_review_start_time: Optional[str] = None
    peer_review_end_time: Optional[str] = None


class AssignmentRead(BaseModel):
    id: int
    classroom_id: int
    classroom_name: str = ""
    content_type: str
    content_id: int
    content_title: str = ""  # Resolved title from content
    title: str
    description: Optional[str] = None
    work_type: str
    is_active: bool
    start_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    auto_peer_review: bool = False
    lesson_info: Optional[Dict[str, Any]] = None
    peer_review_status: Optional[str] = None
    peer_review_start_time: Optional[datetime] = None
    peer_review_end_time: Optional[datetime] = None
    submission_count: int = 0
    total_students: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssignmentListResponse(BaseModel):
    assignments: List[AssignmentRead]
    total: int
