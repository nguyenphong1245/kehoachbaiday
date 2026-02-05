from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import verify_token
from app.db.session import get_db
from app.models.role import Role
from app.models.user import User
from app.models.permission import Permission

http_bearer = HTTPBearer(auto_error=False)


def _extract_token(request: Request, credentials: HTTPAuthorizationCredentials | None) -> str | None:
    """Extract JWT token: httpOnly cookie first, then Bearer header fallback.

    Supports multi-session: checks teacher_access_token and student_access_token cookies
    to allow teacher and student login simultaneously.
    """
    # 1. Try role-specific httpOnly cookies (multi-session support)
    teacher_token = request.cookies.get("teacher_access_token")
    if teacher_token:
        return teacher_token

    student_token = request.cookies.get("student_access_token")
    if student_token:
        return student_token

    # 2. Fallback to legacy cookie name (backward compat)
    legacy_token = request.cookies.get("access_token")
    if legacy_token:
        return legacy_token

    # 3. Fallback to Authorization: Bearer header (backward compat)
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    return None


async def get_session(session: AsyncSession = Depends(get_db)) -> AsyncSession:
    return session


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    session: AsyncSession = Depends(get_db),
) -> User:
    token = _extract_token(request, credentials)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    subject = verify_token(token)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    try:
        user_id = int(subject)
    except ValueError as exc:  # pragma: no cover - defensive branch
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject") from exc

    result = await session.execute(
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.profile),
            selectinload(User.settings),
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user


async def get_current_user_optional(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    session: AsyncSession = Depends(get_db),
) -> User | None:
    """Get current user if authenticated, otherwise return None (for public endpoints)"""
    token = _extract_token(request, credentials)
    if not token:
        return None

    subject = verify_token(token)
    if subject is None:
        return None

    try:
        user_id = int(subject)
    except ValueError:
        return None

    result = await session.execute(
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.profile),
            selectinload(User.settings),
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        return None
    return user


def user_has_role(user: User, role_name: str) -> bool:
    return any(role.name == role_name for role in user.roles)


def user_has_permission(user: User, permission_name: str) -> bool:
    for role in user.roles:
        for perm in role.permissions:
            if perm.name == permission_name:
                return True
    return False


def require_role(role_name: str):
    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not user_has_role(current_user, role_name):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return dependency


require_admin = require_role("admin")


def require_teacher():
    """Require 'teacher' or 'user' role (excludes student-only accounts)."""
    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if user_has_role(current_user, "teacher") or user_has_role(current_user, "user") or user_has_role(current_user, "admin"):
            return current_user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return dependency


def require_permission(permission_name: str):
    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not user_has_permission(current_user, permission_name):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return dependency
