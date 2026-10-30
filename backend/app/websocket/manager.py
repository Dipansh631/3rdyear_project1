import asyncio
import json
from typing import List
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        text_data = json.dumps(message)
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(text_data)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)

ws_manager = WebSocketManager()
