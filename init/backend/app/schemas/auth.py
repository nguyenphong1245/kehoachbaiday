from __future__ import annotations

from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.user import UserRead
from app.schemas.validators import validate_password as _validate_password


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(Token):
    user: UserRead


class LoginResponse(BaseModel):
    """Response for login — tokens are sent via httpOnly cookies."""
    user: UserRead


class TokenPayload(BaseModel):
    sub: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class StudentLoginRequest(BaseModel):
    username: str
    password: str


class EmailVerificationConfirm(BaseModel):
    email: EmailStr
    token: str

    @field_validator("token")
    @classmethod
    def token_must_be_digits(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit() or len(v) != 8:
            raise ValueError("Mã xác minh phải là 8 chữ số")
        return v


class EmailVerificationResend(BaseModel):
    email: EmailStr


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    password: str

    @field_validator("token")
    @classmethod
    def token_must_be_digits(cls, v: str) -> str:
        v = v.strip()
        if not v.isdigit() or len(v) != 8:
            raise ValueError("Mã đặt lại phải là 8 chữ số")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password(v)


class ChangePassword(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password(v)


class AuthMessage(BaseModel):
    message: str
