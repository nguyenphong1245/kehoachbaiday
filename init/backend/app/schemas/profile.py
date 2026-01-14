from pydantic import BaseModel


class UserProfileBase(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileRead(UserProfileBase):
    id: int

    # Pydantic v2 compatibility: allow parsing from ORM objects
    model_config = {"from_attributes": True}
