import os

# Override settings BEFORE any app import
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["SQL_DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://khbd:khbd_password@localhost:5432/khbd_test",
)

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.db.base import Base
from app.db.session import get_db
from app.main import get_app

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
async def client():
    """Async test client with database override."""
    app = get_app()
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
