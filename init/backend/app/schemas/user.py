from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.validators import validate_password as _validate_password
from app.schemas.profile import UserProfileRead
from app.schemas.role import RoleRead
from app.schemas.settings import UserSettingsRead


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password(v)


class UserRead(BaseModel):
    id: int
    email: str  # plain str to support both email and student username
    is_active: bool
    is_verified: bool
    token_balance: int = 20000
    tokens_used: int = 0
    created_at: datetime
    roles: list[RoleRead] = []
    profile: UserProfileRead | None = None
    settings: UserSettingsRead | None = None

    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role_ids: list[int]
