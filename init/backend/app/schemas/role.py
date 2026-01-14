from __future__ import annotations

from pydantic import BaseModel

from app.schemas.permission import PermissionRead


class RoleBase(BaseModel):
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    pass


class RoleRead(RoleBase):
    id: int
    permissions: list[PermissionRead] = []

    # Pydantic v2 compatibility: allow parsing from ORM objects
    model_config = {"from_attributes": True}


class RolePermissionUpdate(BaseModel):
    permission_ids: list[int]
