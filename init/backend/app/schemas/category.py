from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
