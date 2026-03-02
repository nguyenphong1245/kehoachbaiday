"""
Schemas for Guide Card management
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class GuideCardPublic(BaseModel):
    """Public-facing schema for the guide page"""
    id: int
    card_key: str
    icon_name: str
    color: str
    icon_color: str
    title: str
    description: str
    content_html: str
    video_url: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True


class GuideCardRead(BaseModel):
    """Full schema for admin view"""
    id: int
    card_key: str
    icon_name: str
    color: str
    icon_color: str
    title: str
    description: str
    content_html: str
    video_url: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GuideCardUpdate(BaseModel):
    """Fields admin can update"""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    content_html: Optional[str] = None
    video_url: Optional[str] = Field(None, max_length=500)
    icon_name: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=200)
    icon_color: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None


class GuideCardReorderRequest(BaseModel):
    """Reorder request: list of card IDs in desired order"""
    card_ids: list[int]
