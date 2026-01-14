from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.profile import UserProfileRead
from app.schemas.role import RoleRead
from app.schemas.settings import UserSettingsRead


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    roles: list[RoleRead] = []
    profile: UserProfileRead | None = None
    settings: UserSettingsRead | None = None

    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role_ids: list[int]
