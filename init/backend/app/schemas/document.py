from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.schemas.category import CategoryRead


class DocumentBase(BaseModel):
    title: str | None = None
    content: str | None = None
    category_id: str | None = None


class DocumentCreate(DocumentBase):
    id: str | None = None


class DocumentRead(DocumentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
