# backend/app/api/v1/chat.py

from typing import List

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import decode_access_token
from app.core.connection_manager import ConnectionManager
from app.db.session import get_db
from app.models.user import User
from app.models.message import ChatMessage
from app.schemas.message import MessageRead
from app.api.v1.users import get_current_user  # REST auth dependency

router = APIRouter(tags=["chat"])
manager = ConnectionManager()


async def get_current_user_ws(
    token: str,
    db: AsyncSession,
) -> User:
    """
    Decode JWT from WebSocket query param & fetch the User.
    """
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if not username:
            raise ValueError("Missing subject in token")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    result = await db.execute(select(User).filter_by(username=username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.websocket("/ws")
async def websocket_chat(
    websocket: WebSocket,
    db: AsyncSession = Depends(get_db),
):
    """
    WebSocket endpoint for real-time chat.
    Connect to: ws://<host>/api/v1/chat/ws?token=<JWT>
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Authenticate connection
    try:
        user = await get_current_user_ws(token, db)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(user.id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            to_user_id = data.get("to")
            content = data.get("content")
            if to_user_id is None or content is None:
                continue

            # Persist the message
            msg = ChatMessage(
                sender_id=user.id,
                recipient_id=to_user_id,
                content=content,
            )
            db.add(msg)
            await db.commit()
            await db.refresh(msg)

            payload = {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "recipient_id": msg.recipient_id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
            }

            # Send to recipient and echo back to sender
            await manager.send_personal_message(payload, to_user_id)
            await manager.send_personal_message(payload, user.id)

    except WebSocketDisconnect:
        manager.disconnect(user.id, websocket)


@router.get(
    "/history/{other_user_id}",
    response_model=List[MessageRead],
    summary="Get chat history",
)
async def get_chat_history(
    other_user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all messages between the authenticated user and other_user_id,
    ordered by timestamp ascending.
    """
    user_id = current_user.id
    stmt = (
        select(ChatMessage)
        .filter(
            ((ChatMessage.sender_id == user_id) & (ChatMessage.recipient_id == other_user_id))
            | ((ChatMessage.sender_id == other_user_id) & (ChatMessage.recipient_id == user_id))
        )
        .order_by(ChatMessage.timestamp)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get(
    "/online",
    response_model=List[int],
    summary="Get online user IDs",
)
async def get_online_users():
    """
    List user IDs currently connected via WebSocket.
    """
    return manager.get_online_users()
