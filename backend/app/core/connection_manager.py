# backend/app/core/connection_manager.py

import logging
from typing import Dict, List

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for real-time chat.
    Supports multiple concurrent connections per user,
    graceful cleanup, and broadcasting.
    """

    def __init__(self):
        # Maps user_id to a list of WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        """
        Accepts the WebSocket and registers it under the given user_id.
        """
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)
        logger.info(f"User {user_id} connected ({len(self.active_connections[user_id])} sessions).")

    def disconnect(self, user_id: int, websocket: WebSocket):
        """
        Removes a specific WebSocket connection for a user.
        Cleans up the user entry if no connections remain.
        """
        connections = self.active_connections.get(user_id)
        if not connections:
            return
        if websocket in connections:
            connections.remove(websocket)
            logger.info(f"User {user_id} disconnected ({len(connections)} sessions remaining).")
        if not connections:
            self.active_connections.pop(user_id, None)
            logger.info(f"No active sessions left for user {user_id}; removed from registry.")

    async def send_personal_message(self, message: dict, user_id: int):
        """
        Sends a JSON message to all active WebSocket sessions of a single user.
        Cleans up any sessions that have been closed unexpectedly.
        """
        connections = self.active_connections.get(user_id, [])
        for ws in connections.copy():
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id, ws)

    async def broadcast(self, message: dict, exclude_user_id: int = None):
        """
        Broadcasts a JSON message to all users except the optional exclude_user_id.
        Cleans up any closed connections encountered.
        """
        for uid, connections in list(self.active_connections.items()):
            if uid == exclude_user_id:
                continue
            for ws in connections.copy():
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.warning(f"Error broadcasting to user {uid}: {e}")
                    self.disconnect(uid, ws)

    def get_online_users(self) -> List[int]:
        """
        Returns a list of user_ids who currently have at least one active connection.
        """
        return list(self.active_connections.keys())
