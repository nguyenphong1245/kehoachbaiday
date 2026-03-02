"""Factory functions for creating test data."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.class_assignment import ClassAssignment
from app.models.class_student import ClassStudent
from app.models.classroom import Classroom
from app.models.student_group import GroupMember
from app.models.guide_card import GuideCard
from app.models.profile import UserProfile
from app.models.role import Role
from app.models.settings import UserSettings
from app.models.student_group import StudentGroup
from app.models.user import User


async def create_role(session: AsyncSession, name: str, description: str = "") -> Role:
    role = Role(name=name, description=description or f"{name} role")
    session.add(role)
    await session.flush()
    return role


async def ensure_roles(session: AsyncSession) -> dict[str, Role]:
    """Create default roles and return them as a dict."""
    roles = {}
    for name in ("admin", "teacher", "user", "student"):
        roles[name] = await create_role(session, name)
    await session.flush()
    return roles


async def create_user(
    session: AsyncSession,
    *,
    email: str = "teacher@test.com",
    password: str = "StrongPass1!",
    is_verified: bool = True,
    is_active: bool = True,
    role_names: list[str] | None = None,
    roles: dict[str, Role] | None = None,
    token_balance: int = 20000,
) -> User:
    """Create a user with profile and settings."""
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        is_verified=is_verified,
        is_active=is_active,
        token_balance=token_balance,
    )
    user.profile = UserProfile()
    user.settings = UserSettings()

    if role_names and roles:
        for rn in role_names:
            if rn in roles:
                user.roles.append(roles[rn])

    session.add(user)
    await session.flush()
    return user


async def create_teacher(session: AsyncSession, roles: dict[str, Role], **kwargs) -> User:
    defaults = {"email": "teacher@test.com", "role_names": ["teacher", "user"]}
    defaults.update(kwargs)
    return await create_user(session, roles=roles, **defaults)


async def create_admin(session: AsyncSession, roles: dict[str, Role], **kwargs) -> User:
    defaults = {"email": "admin@test.com", "role_names": ["admin", "teacher", "user"]}
    defaults.update(kwargs)
    return await create_user(session, roles=roles, **defaults)


async def create_student_user(session: AsyncSession, roles: dict[str, Role], **kwargs) -> User:
    defaults = {"email": "HS001", "password": "HS001", "role_names": ["student"], "is_verified": True}
    defaults.update(kwargs)
    return await create_user(session, roles=roles, **defaults)


async def create_classroom(
    session: AsyncSession,
    teacher: User,
    *,
    name: str = "Lop 10A1",
    grade: str = "10",
    school_year: str = "2025-2026",
) -> Classroom:
    classroom = Classroom(
        name=name,
        teacher_id=teacher.id,
        grade=grade,
        school_year=school_year,
    )
    session.add(classroom)
    await session.flush()
    return classroom


async def create_class_student(
    session: AsyncSession,
    classroom: Classroom,
    user: User,
    *,
    full_name: str = "Nguyen Van A",
    student_code: str = "HS001",
    student_number: int = 1,
) -> ClassStudent:
    cs = ClassStudent(
        classroom_id=classroom.id,
        user_id=user.id,
        full_name=full_name,
        student_code=student_code,
        student_number=student_number,
    )
    session.add(cs)
    await session.flush()
    return cs


async def create_student_group(
    session: AsyncSession,
    classroom: Classroom,
    *,
    name: str = "Nhom 1",
    member_student_ids: list[int] | None = None,
) -> StudentGroup:
    group = StudentGroup(classroom_id=classroom.id, name=name)
    session.add(group)
    await session.flush()

    if member_student_ids:
        for sid in member_student_ids:
            member = GroupMember(group_id=group.id, student_id=sid)
            session.add(member)
        await session.flush()

    return group


async def create_assignment(
    session: AsyncSession,
    classroom: Classroom,
    *,
    content_type: str = "worksheet",
    content_id: int = 1,
    title: str = "Bai tap 1",
    work_type: str = "individual",
    start_at: datetime | None = None,
    due_date: datetime | None = None,
) -> ClassAssignment:
    assignment = ClassAssignment(
        classroom_id=classroom.id,
        content_type=content_type,
        content_id=content_id,
        title=title,
        work_type=work_type,
        start_at=start_at,
        due_date=due_date,
    )
    session.add(assignment)
    await session.flush()
    return assignment


async def create_guide_card(
    session: AsyncSession,
    *,
    card_key: str = "getting_started",
    title: str = "Getting Started",
    sort_order: int = 0,
    is_active: bool = True,
) -> GuideCard:
    card = GuideCard(
        card_key=card_key,
        icon_name="book",
        color="bg-blue-500",
        icon_color="text-white",
        title=title,
        description="A description",
        content_html="<p>Content</p>",
        sort_order=sort_order,
        is_active=is_active,
    )
    session.add(card)
    await session.flush()
    return card
