from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.permission import Permission
from app.models.role import Role
from app.schemas import PermissionCreate, PermissionRead, RoleCreate, RolePermissionUpdate, RoleRead

router = APIRouter(dependencies=[Depends(require_admin)])
permissions_router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("", response_model=list[RoleRead])
async def list_roles(session: AsyncSession = Depends(get_db)) -> list[Role]:
    result = await session.execute(select(Role).options(selectinload(Role.permissions)))
    return result.scalars().unique().all()


@router.post("", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
async def create_role(role_in: RoleCreate, session: AsyncSession = Depends(get_db)) -> Role:
    existing = await session.execute(select(Role).where(Role.name == role_in.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role name already exists")

    role = Role(name=role_in.name, description=role_in.description)
    session.add(role)
    await session.commit()
    await session.refresh(role)
    return role


@router.post("/{role_id}/permissions", response_model=RoleRead)
async def set_role_permissions(
    role_id: int,
    payload: RolePermissionUpdate,
    session: AsyncSession = Depends(get_db),
) -> Role:
    role = await session.get(Role, role_id, options=[selectinload(Role.permissions)])
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    if not payload.permission_ids:
        role.permissions = []
    else:
        permissions_result = await session.execute(
            select(Permission).where(Permission.id.in_(payload.permission_ids))
        )
        permissions = permissions_result.scalars().all()
        if len(permissions) != len(set(payload.permission_ids)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more permissions not found")
        role.permissions = permissions

    await session.commit()
    await session.refresh(role)
    return role


@permissions_router.get("", response_model=list[PermissionRead])
async def list_permissions(session: AsyncSession = Depends(get_db)) -> list[Permission]:
    result = await session.execute(select(Permission))
    return result.scalars().all()


@permissions_router.post("", response_model=PermissionRead, status_code=status.HTTP_201_CREATED)
async def create_permission(permission_in: PermissionCreate, session: AsyncSession = Depends(get_db)) -> Permission:
    existing = await session.execute(select(Permission).where(Permission.name == permission_in.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Permission name already exists")

    permission = Permission(name=permission_in.name, description=permission_in.description)
    session.add(permission)
    await session.commit()
    await session.refresh(permission)
    return permission
