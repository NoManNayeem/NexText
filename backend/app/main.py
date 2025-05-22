# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.api.v1 import users, chat
from app.db.base import Base
from app.db.session import engine

app = FastAPI(
    title="NexText API",
    version="0.1.0",
    description="A real-time chat application backend",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # allow_origins=CORS_ORIGINS,
     allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    """
    Create all database tables on startup if they don't exist.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health", summary="Health Check")
async def health_check():
    """
    Simple health check endpoint.
    """
    return {"status": "OK"}

# User routes (mounted with their own prefix)
app.include_router(users.router)

# Chat routes (WebSocket + history) under /api/v1/chat
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
