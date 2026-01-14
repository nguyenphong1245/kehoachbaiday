from pydantic import BaseModel


class PermissionBase(BaseModel):
    name: str
    description: str | None = None


class PermissionCreate(PermissionBase):
    pass


class PermissionRead(PermissionBase):
    id: int

    # Pydantic v2 compatibility: allow parsing from ORM objects
    model_config = {"from_attributes": True}
