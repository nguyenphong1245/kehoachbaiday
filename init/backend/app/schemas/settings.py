from pydantic import BaseModel, field_validator


class UserSettingsBase(BaseModel):
    theme: str = "system"
    language: str = "en"
    marketing_emails_enabled: bool = True
    push_notifications_enabled: bool = True
    timezone: str | None = None
    teaching_tools: list[str] | None = None
    custom_tools: list[str] | None = None
    teaching_style: str | None = None


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    marketing_emails_enabled: bool | None = None
    push_notifications_enabled: bool | None = None
    timezone: str | None = None
    teaching_tools: list[str] | None = None
    custom_tools: list[str] | None = None
    teaching_style: str | None = None

    @field_validator("teaching_tools")
    @classmethod
    def validate_teaching_tools(cls, v):
        if v is not None and len(v) > 50:
            raise ValueError("Tối đa 50 công cụ")
        return v

    @field_validator("custom_tools")
    @classmethod
    def validate_custom_tools(cls, v):
        if v is not None and len(v) > 20:
            raise ValueError("Tối đa 20 công cụ tùy chỉnh")
        return v

    @field_validator("teaching_style")
    @classmethod
    def validate_teaching_style(cls, v):
        if v is not None and len(v) > 2000:
            raise ValueError("Phong cách dạy học tối đa 2000 ký tự")
        return v


class UserSettingsRead(UserSettingsBase):
    id: int

    model_config = {"from_attributes": True}
