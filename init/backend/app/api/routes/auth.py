from datetime import datetime, timedelta, timezone

import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.logging import logger
from app.core.security import create_access_token, generate_otp_code, generate_secure_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.models.profile import UserProfile
from app.models.role import Role
from app.models.settings import UserSettings
from app.models.user import User
from app.schemas import (
    AuthMessage,
    AuthResponse,
    EmailVerificationConfirm,
    EmailVerificationResend,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    UserCreate,
    UserRead,
)
from app.services.email_service import send_password_reset_email, send_verification_email
from app.services.notifications import notify_admin

router = APIRouter()
settings = get_settings()


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def ensure_role(session: AsyncSession, name: str, description: str | None = None) -> Role:
    result = await session.execute(select(Role).where(Role.name == name))
    role = result.scalar_one_or_none()
    if role is None:
        role = Role(name=name, description=description)
        session.add(role)
        await session.flush()
    return role


def user_with_relationships_query(user_id: int | None = None):
    stmt = (
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.profile),
            selectinload(User.settings),
        )
    )
    if user_id is not None:
        stmt = stmt.where(User.id == user_id)
    return stmt

async def issue_verification_token(session: AsyncSession, user: User, background_tasks: BackgroundTasks) -> str:
    await session.execute(delete(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id))
    token_value = generate_otp_code(6)  # Generate 6-digit OTP
    hashed_token = hash_token(token_value)
    expires_at = _utcnow() + timedelta(minutes=settings.email_verification_token_expire_minutes)
    session.add(EmailVerificationToken(token=hashed_token, user_id=user.id, expires_at=expires_at))
    await session.flush()
    background_tasks.add_task(send_verification_email, user.email, token_value)
    logger.info("user.verification_token_issued email=%s user_id=%s", user.email, user.id)
    return token_value


async def issue_password_reset_token(session: AsyncSession, user: User) -> str:
    await session.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
    token_value = generate_otp_code(6)  # Generate 6-digit OTP
    expires_at = _utcnow() + timedelta(minutes=settings.password_reset_token_expire_minutes)
    session.add(PasswordResetToken(token=token_value, user_id=user.id, expires_at=expires_at))
    await session.flush()
    send_password_reset_email(user.email, token_value)
    logger.info("user.password_reset_token_issued email=%s user_id=%s", user.email, user.id)
    return token_value


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate,  background_tasks: BackgroundTasks, session: AsyncSession = Depends(get_db)) -> User:
    result = await session.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    default_role = await ensure_role(session, "user", "Default user role")

    new_user = User(
        email=user_in.email, 
        hashed_password=get_password_hash(user_in.password),
        is_verified=False
    )
    new_user.roles.append(default_role)
    new_user.profile = UserProfile()
    new_user.settings = UserSettings()
    session.add(new_user)
    await session.flush()
    
    # Issue verification token and send email
    await issue_verification_token(session, new_user, background_tasks)

    await session.commit()

    background_tasks.add_task(
        notify_admin,
        subject="New user registration",
        body=f"A new user has registered: {new_user.email}",
    )

    refreshed = await session.execute(user_with_relationships_query(new_user.id))
    return refreshed.scalar_one()


@router.post("/login", response_model=AuthResponse)
async def login_user(login_in: LoginRequest, session: AsyncSession = Depends(get_db)) -> AuthResponse:
    result = await session.execute(
        user_with_relationships_query().where(User.email == login_in.email)
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(login_in.password, user.hashed_password):
        logger.warning("user.login_failed email=%s", login_in.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # TẠM THỜI BỎ QUA XÁC MINH EMAIL
    # if not user.is_verified:
    #     logger.warning("user.login_failed_not_verified email=%s", login_in.email)
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Please verify your email before logging in. Check your inbox for the verification link.",
    #     )

    token = create_access_token(subject=str(user.id))
    logger.info("user.login_success email=%s user_id=%s", user.email, user.id)
    return AuthResponse(access_token=token, user=user)


@router.post("/verify-email", response_model=AuthMessage)
async def verify_email(
    payload: EmailVerificationConfirm,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    # Hash the token before looking it up
    hashed_token = hash_token(payload.token)
    token_result = await session.execute(
        select(EmailVerificationToken).where(EmailVerificationToken.token == hashed_token)
    )
    token_row = token_result.scalar_one_or_none()
    if token_row is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    expires_at = token_row.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < _utcnow():
        await session.delete(token_row)
        await session.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    user = await session.get(User, token_row.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    user.is_verified = True
    await session.execute(delete(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id))
    await session.commit()
    logger.info("user.email_verified email=%s user_id=%s", user.email, user.id)

    return AuthMessage(message="Email successfully verified. You can now sign in.")


@router.post("/resend-verification", response_model=AuthMessage)
async def resend_verification(
    payload: EmailVerificationResend,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None:
        return AuthMessage(message="If an account exists for that email, a verification message has been sent.")

    if user.is_verified:
        return AuthMessage(message="Email is already verified.")

    await issue_verification_token(session, user, background_tasks)
    await session.commit()
    logger.info("user.verification_email_resent email=%s user_id=%s", user.email, user.id)
    return AuthMessage(message="Verification email sent.")


@router.post("/request-password-reset", response_model=AuthMessage)
async def request_password_reset(
    payload: PasswordResetRequest,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None:
        return AuthMessage(message="If an account exists for that email, a reset link has been sent.")

    await issue_password_reset_token(session, user)
    await session.commit()
    logger.info("user.password_reset_requested email=%s user_id=%s", user.email, user.id)
    return AuthMessage(message="Password reset instructions sent if the account exists.")


@router.post("/reset-password", response_model=AuthMessage)
async def reset_password(
    payload: PasswordResetConfirm,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    token_result = await session.execute(
        select(PasswordResetToken).where(PasswordResetToken.token == payload.token)
    )
    token_row = token_result.scalar_one_or_none()
    if token_row is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    
    expires_at = token_row.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < _utcnow():
        await session.delete(token_row)
        await session.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    user = await session.get(User, token_row.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    user.hashed_password = get_password_hash(payload.password)
    user.is_verified = True
    await session.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
    await session.commit()
    logger.info("user.password_reset_completed email=%s user_id=%s", user.email, user.id)

    return AuthMessage(message="Password updated. You can now sign in with your new password.")
