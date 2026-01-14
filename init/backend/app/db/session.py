from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

settings = get_settings()

# SQLite với aiosqlite - sử dụng NullPool để tránh connection pooling gây deadlock
engine = create_async_engine(
    settings.sql_database_url,
    future=True,
    echo=False,
    connect_args={
        "timeout": 30,  # Tăng timeout lên 30 giây
    },
    poolclass=NullPool,  # Không dùng connection pool để tránh lock
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session
