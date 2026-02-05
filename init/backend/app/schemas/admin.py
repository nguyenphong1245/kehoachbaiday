"""
Schemas cho Admin Dashboard
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Any


class RecentUser(BaseModel):
    id: int
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TopTeacher(BaseModel):
    id: int
    email: str
    tokens_used: int
    token_balance: int


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    total_lesson_plans: int
    total_quizzes: int
    total_worksheets: int
    total_code_exercises: int
    total_quiz_responses: int
    total_worksheet_responses: int
    total_code_submissions: int
    recent_users: list[RecentUser]
    top_teachers: list[TopTeacher]


class ContentItem(BaseModel):
    id: int
    type: str  # "quiz" | "worksheet" | "code_exercise" | "lesson_plan"
    title: str
    creator_email: str
    creator_id: int
    created_at: datetime
    is_active: bool | None = None
    response_count: int = 0
    lesson_info: dict[str, Any] | None = None
    share_code: str | None = None
    content: str | None = None

    class Config:
        from_attributes = True


class ContentListResponse(BaseModel):
    items: list[ContentItem]
    total: int
    page: int
    limit: int
