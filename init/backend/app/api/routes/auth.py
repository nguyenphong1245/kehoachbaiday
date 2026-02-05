import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.cookies import set_auth_cookies, clear_auth_cookies, set_csrf_cookie, clear_csrf_cookie
from app.core.logging import logger
from app.core.rate_limiter import limiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_otp_code,
    generate_secure_token,
    get_password_hash,
    hash_refresh_token,
    verify_password,
)
from app.db.session import get_db
from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.models.profile import UserProfile
from app.models.refresh_token import RefreshToken
from app.models.role import Role
from app.models.settings import UserSettings
from app.models.user import User
from app.schemas import (
    AuthMessage,
    EmailVerificationConfirm,
    EmailVerificationResend,
    LoginRequest,
    LoginResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    StudentLoginRequest,
    UserCreate,
    UserRead,
)
from app.services.email_service import send_password_reset_email, send_verification_email
from app.services.notifications import notify_admin

router = APIRouter()
settings = get_settings()

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 30
MAX_TOKEN_ATTEMPTS = 5


def _utcnow() -> datetime:
    """Return current UTC time as naive datetime (no timezone info)."""
    return datetime.utcnow()

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
    token_value = generate_otp_code(8)
    hashed_token = hash_token(token_value)
    expires_at = _utcnow() + timedelta(minutes=settings.email_verification_token_expire_minutes)
    session.add(EmailVerificationToken(token=hashed_token, user_id=user.id, expires_at=expires_at))
    await session.flush()
    background_tasks.add_task(send_verification_email, user.email, token_value)
    logger.info("user.verification_token_issued email=%s user_id=%s", user.email, user.id)
    return token_value


async def issue_password_reset_token(session: AsyncSession, user: User) -> str:
    await session.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
    token_value = generate_otp_code(8)
    hashed_token = hash_token(token_value)
    expires_at = _utcnow() + timedelta(minutes=settings.password_reset_token_expire_minutes)
    session.add(PasswordResetToken(token=hashed_token, user_id=user.id, expires_at=expires_at))
    await session.flush()
    send_password_reset_email(user.email, token_value)
    logger.info("user.password_reset_token_issued email=%s user_id=%s", user.email, user.id)
    return token_value


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register_user(request: Request, user_in: UserCreate,  background_tasks: BackgroundTasks, session: AsyncSession = Depends(get_db)) -> User:
    result = await session.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    default_role = await ensure_role(session, "teacher", "Default teacher role")

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


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def login_user(
    request: Request,
    response: Response,
    login_in: LoginRequest,
    session: AsyncSession = Depends(get_db),
) -> LoginResponse:
    result = await session.execute(
        user_with_relationships_query().where(User.email == login_in.email)
    )
    user = result.scalar_one_or_none()

    # Check account lockout
    if user and user.locked_until:
        locked_until = user.locked_until
        if locked_until > _utcnow():
            remaining = int((locked_until - _utcnow()).total_seconds() / 60) + 1
            logger.warning("user.login_blocked_locked email=%s", login_in.email)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Tài khoản tạm khóa do nhập sai quá nhiều lần. Thử lại sau {remaining} phút.",
            )
        # Lock expired, reset
        user.failed_login_attempts = 0
        user.locked_until = None

    if not user or not verify_password(login_in.password, user.hashed_password):
        # Increment failed attempts if user exists
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                user.locked_until = _utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
                logger.warning("user.account_locked email=%s attempts=%d", login_in.email, user.failed_login_attempts)
            await session.commit()
        logger.warning("user.login_failed email=%s", login_in.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        logger.warning("user.login_failed_not_verified email=%s", login_in.email)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link.",
        )

    # Login success - reset failed attempts
    user.failed_login_attempts = 0
    user.locked_until = None

    # Create tokens
    access_token = create_access_token(subject=str(user.id))
    raw_refresh = create_refresh_token()

    # Store hashed refresh token in DB
    session.add(RefreshToken(
        token_hash=hash_refresh_token(raw_refresh),
        user_id=user.id,
        expires_at=_utcnow() + timedelta(days=settings.refresh_token_expire_days),
    ))
    await session.commit()

    # Set httpOnly cookies with teacher_ prefix for multi-session support
    set_auth_cookies(response, access_token, raw_refresh, role_prefix="teacher_")
    # Set CSRF cookie for subsequent requests
    set_csrf_cookie(response)

    logger.info("user.login_success email=%s user_id=%s", user.email, user.id)
    return LoginResponse(user=user)


@router.post("/student-login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def student_login(
    request: Request,
    response: Response,
    login_in: StudentLoginRequest,
    session: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """Login for student accounts (username-based, no email validation)."""
    result = await session.execute(
        user_with_relationships_query().where(User.email == login_in.username)
    )
    user = result.scalar_one_or_none()

    # Check account lockout
    if user and user.locked_until:
        locked_until = user.locked_until
        if locked_until > _utcnow():
            remaining = int((locked_until - _utcnow()).total_seconds() / 60) + 1
            logger.warning("student.login_blocked_locked username=%s", login_in.username)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Tài khoản tạm khóa do nhập sai quá nhiều lần. Thử lại sau {remaining} phút.",
            )
        # Lock expired, reset
        user.failed_login_attempts = 0
        user.locked_until = None

    if not user or not verify_password(login_in.password, user.hashed_password):
        # Increment failed attempts if user exists
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                user.locked_until = _utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
                logger.warning("student.account_locked username=%s attempts=%d", login_in.username, user.failed_login_attempts)
            await session.commit()
        logger.warning("student.login_failed username=%s", login_in.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai tài khoản hoặc mật khẩu",
        )

    # Login success - reset failed attempts
    user.failed_login_attempts = 0
    user.locked_until = None

    # Create tokens
    access_token = create_access_token(subject=str(user.id))
    raw_refresh = create_refresh_token()

    session.add(RefreshToken(
        token_hash=hash_refresh_token(raw_refresh),
        user_id=user.id,
        expires_at=_utcnow() + timedelta(days=settings.refresh_token_expire_days),
    ))
    await session.commit()

    # Set httpOnly cookies with student_ prefix for multi-session support
    set_auth_cookies(response, access_token, raw_refresh, role_prefix="student_")
    # Set CSRF cookie for subsequent requests
    set_csrf_cookie(response)

    logger.info("student.login_success username=%s user_id=%s", login_in.username, user.id)
    return LoginResponse(user=user)


@router.post("/verify-email", response_model=AuthMessage)
@limiter.limit("5/minute")
async def verify_email(
    request: Request,
    payload: EmailVerificationConfirm,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    # Look up user by email
    user_result = await session.execute(select(User).where(User.email == payload.email))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    # Find the user's verification token
    token_result = await session.execute(
        select(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id)
    )
    token_row = token_result.scalar_one_or_none()
    if token_row is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    # Check max attempts
    if token_row.attempts >= MAX_TOKEN_ATTEMPTS:
        await session.delete(token_row)
        await session.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quá nhiều lần thử sai. Vui lòng yêu cầu mã mới.")

    expires_at = token_row.expires_at
    if expires_at < _utcnow():
        await session.delete(token_row)
        await session.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    # Verify the code matches
    hashed_token = hash_token(payload.token)
    if token_row.token != hashed_token:
        token_row.attempts = (token_row.attempts or 0) + 1
        await session.commit()
        remaining = MAX_TOKEN_ATTEMPTS - token_row.attempts
        logger.warning("user.verify_email_wrong_code email=%s attempts=%d", payload.email, token_row.attempts)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Mã không đúng. Còn {remaining} lần thử.")

    user.is_verified = True
    await session.execute(delete(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id))
    await session.commit()
    logger.info("user.email_verified email=%s user_id=%s", user.email, user.id)

    return AuthMessage(message="Email successfully verified. You can now sign in.")


@router.post("/resend-verification", response_model=AuthMessage)
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
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
@limiter.limit("3/minute")
async def request_password_reset(
    request: Request,
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
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    payload: PasswordResetConfirm,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    # Look up user by email
    user_result = await session.execute(select(User).where(User.email == payload.email))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    # Find the user's reset token
    token_result = await session.execute(
        select(PasswordResetToken).where(PasswordResetToken.user_id == user.id)
    )
    token_row = token_result.scalar_one_or_none()
    if token_row is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    # Check max attempts
    if token_row.attempts >= MAX_TOKEN_ATTEMPTS:
        await session.delete(token_row)
        await session.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quá nhiều lần thử sai. Vui lòng yêu cầu mã mới.")

    expires_at = token_row.expires_at
    if expires_at < _utcnow():
        await session.delete(token_row)
        await session.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")

    # Verify the code matches
    hashed_token = hash_token(payload.token)
    if token_row.token != hashed_token:
        token_row.attempts = (token_row.attempts or 0) + 1
        await session.commit()
        remaining = MAX_TOKEN_ATTEMPTS - token_row.attempts
        logger.warning("user.reset_password_wrong_code email=%s attempts=%d", payload.email, token_row.attempts)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Mã không đúng. Còn {remaining} lần thử.")

    user.hashed_password = get_password_hash(payload.password)
    user.is_verified = True
    await session.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
    await session.commit()
    logger.info("user.password_reset_completed email=%s user_id=%s", user.email, user.id)

    return AuthMessage(message="Password updated. You can now sign in with your new password.")


@router.post("/refresh", response_model=AuthMessage)
@limiter.limit("30/minute")
async def refresh_tokens(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    """Use refresh_token cookie to issue a new access_token (token rotation)."""
    raw_refresh = request.cookies.get("refresh_token")
    if not raw_refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    token_hash = hash_refresh_token(raw_refresh)
    result = await session.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False,  # noqa: E712
        )
    )
    rt = result.scalar_one_or_none()

    if not rt:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    expires_at = rt.expires_at
    if expires_at < _utcnow():
        rt.revoked = True
        await session.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    # Rotate: revoke old, create new
    rt.revoked = True

    new_raw = create_refresh_token()
    session.add(RefreshToken(
        token_hash=hash_refresh_token(new_raw),
        user_id=rt.user_id,
        expires_at=_utcnow() + timedelta(days=settings.refresh_token_expire_days),
    ))

    access_token = create_access_token(subject=str(rt.user_id))
    await session.commit()

    set_auth_cookies(response, access_token, new_raw)
    # Renew CSRF token on refresh
    set_csrf_cookie(response)
    logger.info("user.token_refreshed user_id=%s", rt.user_id)
    return AuthMessage(message="Token refreshed")


@router.get("/ws-token")
async def get_ws_token(request: Request) -> dict:
    """Get a token for WebSocket authentication.

    This endpoint validates the httpOnly cookie and returns the access token
    for use in WebSocket connections (which may not receive cookies cross-origin).
    """
    # Check both student and teacher cookies
    token = (
        request.cookies.get("student_access_token") or
        request.cookies.get("teacher_access_token") or
        request.cookies.get("access_token")
    )
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"token": token}


@router.post("/logout", response_model=AuthMessage)
async def logout(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> AuthMessage:
    """Revoke refresh token and clear auth cookies."""
    raw_refresh = request.cookies.get("refresh_token")
    if raw_refresh:
        token_hash = hash_refresh_token(raw_refresh)
        result = await session.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        rt = result.scalar_one_or_none()
        if rt and not rt.revoked:
            rt.revoked = True
            await session.commit()

    clear_auth_cookies(response)
    clear_csrf_cookie(response)
    logger.info("user.logout")
    return AuthMessage(message="Logged out")
