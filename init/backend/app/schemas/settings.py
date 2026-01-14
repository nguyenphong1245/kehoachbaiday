from pydantic import BaseModel


class UserSettingsBase(BaseModel):
    theme: str = "system"
    language: str = "en"
    marketing_emails_enabled: bool = True
    push_notifications_enabled: bool = True
    timezone: str | None = None


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    marketing_emails_enabled: bool | None = None
    push_notifications_enabled: bool | None = None
    timezone: str | None = None


class UserSettingsRead(UserSettingsBase):
    id: int

    # Pydantic v2 compatibility: allow parsing from ORM objects
    model_config = {"from_attributes": True}
