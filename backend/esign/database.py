"""PostgreSQL async engine + session factory for the eSign module."""
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def _build_engine():
    url = os.environ["DATABASE_URL"]
    return create_async_engine(url, pool_pre_ping=True, pool_size=5, max_overflow=10, echo=False)


engine = _build_engine()
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session


async def init_esign_db():
    """Create all tables (idempotent)."""
    from . import models  # noqa: F401 — ensure models are registered
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
