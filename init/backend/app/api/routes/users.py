from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, require_admin, user_has_role
from app.db.session import get_db
from app.models.profile import UserProfile
from app.models.role import Role
from app.models.settings import UserSettings
from app.models.user import User
from app.schemas import (
    AuthMessage,
    ChangePassword,
    UserProfileRead,
    UserProfileUpdate,
    UserRead,
    UserRoleUpdate,
    UserSettingsRead,
    UserSettingsUpdate,
)
from app.core.security import get_password_hash, verify_password

router = APIRouter()


def user_query(user_id: int | None = None):
    stmt = select(User).options(
        selectinload(User.roles).selectinload(Role.permissions),
        selectinload(User.profile),
        selectinload(User.settings),
    )
    if user_id is not None:
        stmt = stmt.where(User.id == user_id)
    return stmt


@router.get("/users", response_model=list[UserRead], dependencies=[Depends(require_admin)])
async def list_users(session: AsyncSession = Depends(get_db)) -> list[User]:
    result = await session.execute(user_query())
    return result.scalars().unique().all()


@router.get("/users/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.id != user_id and not user_has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user")

    user_result = await session.execute(user_query(user_id))
    instance = user_result.scalar_one_or_none()
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return instance


@router.put("/users/{user_id}/roles", response_model=UserRead, dependencies=[Depends(require_admin)])
async def update_user_roles(
    user_id: int,
    payload: UserRoleUpdate,
    session: AsyncSession = Depends(get_db),
) -> User:
    user = await session.get(User, user_id, options=[selectinload(User.roles)])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not payload.role_ids:
        user.roles = []
    else:
        roles_result = await session.execute(select(Role).where(Role.id.in_(payload.role_ids)))
        roles = roles_result.scalars().all()
        if len(roles) != len(set(payload.role_ids)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more roles not found")
        user.roles = roles

    await session.commit()
    refreshed = await session.execute(user_query(user_id))
    return refreshed.scalar_one()


@router.get("/users/{user_id}/profile", response_model=UserProfileRead)
async def get_user_profile(
    user_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserProfile:
    if current_user.id != user_id and not user_has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this profile")

    user = await session.get(User, user_id, options=[selectinload(User.profile)])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.profile is None:
        user.profile = UserProfile()
        await session.commit()
        await session.refresh(user)

    return user.profile


@router.put("/users/{user_id}/profile", response_model=UserProfileRead)
async def update_user_profile(
    user_id: int,
    payload: UserProfileUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserProfile:
    if current_user.id != user_id and not user_has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this profile")

    user = await session.get(User, user_id, options=[selectinload(User.profile)])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    profile = user.profile
    if profile is None:
        profile = UserProfile()
        user.profile = profile

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await session.commit()
    await session.refresh(profile)
    return profile


@router.get("/users/{user_id}/settings", response_model=UserSettingsRead)
async def get_user_settings(
    user_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserSettings:
    if current_user.id != user_id and not user_has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these settings")

    user = await session.get(User, user_id, options=[selectinload(User.settings)])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.settings is None:
        user.settings = UserSettings()
        await session.commit()
        await session.refresh(user)

    return user.settings


@router.put("/users/{user_id}/settings", response_model=UserSettingsRead)
async def update_user_settings(
    user_id: int,
    payload: UserSettingsUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserSettings:
    if current_user.id != user_id and not user_has_role(current_user, "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update these settings")

    user = await session.get(User, user_id, options=[selectinload(User.settings)])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    settings = user.settings
    if settings is None:
        settings = UserSettings()
        user.settings = settings

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    await session.commit()
    await session.refresh(settings)
    return settings


@router.post("/users/me/change-password", response_model=AuthMessage)
async def change_password(
    payload: ChangePassword,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AuthMessage:
    """Change password for current logged-in user"""
    # Verify old password
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu cũ không đúng"
        )
    
    # Validate new password length
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới phải có ít nhất 6 ký tự"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(payload.new_password)
    await session.commit()
    
    return AuthMessage(message="Đổi mật khẩu thành công")


@router.delete("/users/{user_id}", response_model=AuthMessage, dependencies=[Depends(require_admin)])
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AuthMessage:
    """Delete a user account (admin only)"""
    # Không cho phép admin tự xóa chính mình
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xóa tài khoản của chính mình"
        )
    
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng"
        )
    
    await session.delete(user)
    await session.commit()
    
    return AuthMessage(message="Đã xóa tài khoản người dùng thành công")
