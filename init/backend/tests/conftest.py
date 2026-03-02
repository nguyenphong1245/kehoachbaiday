import os

# Fix passlib + bcrypt>=4.1 compatibility (bcrypt 5.x raises on >72 bytes)
import bcrypt as _bcrypt_mod
_orig_hashpw = _bcrypt_mod.hashpw
_orig_checkpw = _bcrypt_mod.checkpw

def _safe_hashpw(password, salt):
    if isinstance(password, str):
        password = password.encode("utf-8")
    return _orig_hashpw(password[:72], salt)

def _safe_checkpw(password, hashed_password):
    if isinstance(password, str):
        password = password.encode("utf-8")
    return _orig_checkpw(password[:72], hashed_password)

_bcrypt_mod.hashpw = _safe_hashpw
_bcrypt_mod.checkpw = _safe_checkpw

# Override settings BEFORE any app import
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["SQL_DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://khbd:Khbd2025Phong@localhost:5432/khbd_test",
)
# Disable rate limiting in tests
os.environ["RATELIMIT_ENABLED"] = "false"

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.db.base import Base
from app.db.session import get_db
from app.main import get_app
from tests.helpers.factories import (
    create_admin,
    create_assignment,
    create_class_student,
    create_classroom,
    create_student_user,
    create_teacher,
    ensure_roles,
)

TEST_DATABASE_URL = os.environ["SQL_DATABASE_URL"]

engine = create_async_engine(
    TEST_DATABASE_URL,
    future=True,
    echo=False,
    poolclass=NullPool,
)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@pytest.fixture(autouse=True)
async def setup_database():
    """Create tables before each test and drop after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def db_session():
    """Provide a database session for direct DB operations in tests."""
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def client():
    """Async test client with database override."""
    app = get_app()
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", follow_redirects=True) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def roles(db_session: AsyncSession):
    """Create and return all default roles."""
    r = await ensure_roles(db_session)
    await db_session.commit()
    return r


@pytest.fixture
async def teacher_user(db_session: AsyncSession, roles):
    """Create a verified teacher user."""
    user = await create_teacher(db_session, roles)
    await db_session.commit()
    return user


@pytest.fixture
async def admin_user(db_session: AsyncSession, roles):
    """Create a verified admin user."""
    user = await create_admin(db_session, roles)
    await db_session.commit()
    return user


@pytest.fixture
async def student_user(db_session: AsyncSession, roles):
    """Create a student user."""
    user = await create_student_user(db_session, roles)
    await db_session.commit()
    return user


@pytest.fixture
async def classroom(db_session: AsyncSession, teacher_user):
    """Create a classroom owned by teacher_user."""
    c = await create_classroom(db_session, teacher_user)
    await db_session.commit()
    return c


@pytest.fixture
async def class_student(db_session: AsyncSession, classroom, student_user):
    """Enroll student_user in the classroom."""
    cs = await create_class_student(db_session, classroom, student_user)
    await db_session.commit()
    return cs


@pytest.fixture
async def assignment(db_session: AsyncSession, classroom):
    """Create an assignment in the classroom."""
    a = await create_assignment(db_session, classroom)
    await db_session.commit()
    return a
