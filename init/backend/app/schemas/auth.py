from __future__ import annotations

from pydantic import BaseModel, EmailStr

from app.schemas.user import UserRead


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(Token):
    user: UserRead


class TokenPayload(BaseModel):
    sub: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class EmailVerificationConfirm(BaseModel):
    token: str


class EmailVerificationResend(BaseModel):
    email: EmailStr


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    password: str


class ChangePassword(BaseModel):
    old_password: str
    new_password: str


class AuthMessage(BaseModel):
    message: str
