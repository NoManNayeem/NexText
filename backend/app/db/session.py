# backend/app/db/session.py

"""
Async SQLAlchemy session and engine setup.

Provides:
- engine: AsyncEngine connected via DATABASE_URL
- AsyncSessionLocal: session factory for AsyncSession
- get_db: FastAPI dependency yielding an AsyncSession
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import DATABASE_URL

# Create the async engine
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=True,      # toggle SQL logging; set False in production
    future=True,    # use 2.0 style API
)

# Configure a sessionmaker for AsyncSession
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # prevent attribute expiration after commit
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency: yields an AsyncSession and ensures its closure.
    Usage:
        async def endpoint(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        yield session
