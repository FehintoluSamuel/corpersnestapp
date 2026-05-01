"""websocket/manager.py"""

import json
import logging
from typing import Dict
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages active WebSocket connections keyed by user_id.
    One user can have multiple tabs open — we store a list per user.
    """

    def __init__(self):
        self.active: Dict[int, list[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)
        logger.info(f'WS connected: user {user_id} ({len(self.active[user_id])} tabs)')

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active:
            self.active[user_id] = [ws for ws in self.active[user_id] if ws is not websocket]
            if not self.active[user_id]:
                del self.active[user_id]
        logger.info(f'WS disconnected: user {user_id}')

    def is_online(self, user_id: int) -> bool:
        return user_id in self.active and len(self.active[user_id]) > 0

    async def send_to_user(self, user_id: int, payload: dict):
        """Push a JSON payload to all tabs of a user. Silently removes dead sockets."""
        if user_id not in self.active:
            return
        dead = []
        for ws in self.active[user_id]:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)


# Singleton — import this everywhere
manager = ConnectionManager()