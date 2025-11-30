from fastapi import WebSocket
from pydantic import BaseModel
from uuid import UUID
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.active_rooms: Dict[UUID, List[WebSocket]] = {}
        self.MAX_CAPACITY = 2

    def is_room_full(self, room_id: UUID):
        if room_id not in self.active_rooms:
            return False
        return len(self.active_rooms[room_id]) >= self.MAX_CAPACITY

    async def connect(self, room_id: UUID, websocket: WebSocket):
        if self.is_room_full(room_id):
            return False

        await websocket.accept()

        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []

        self.active_rooms[room_id].append(websocket)
        return True
    
    async def disconnect(self,room_id: UUID, websocket: WebSocket):
        if room_id in self.active_rooms:
            self.active_rooms[room_id].remove(websocket)    
            
            if not self.active_rooms[room_id]:
                    del self.active_rooms[room_id]

    async def broadcast(self, content: str, room_id: UUID, sendersocket: WebSocket):
        if room_id in self.active_rooms:
            for socket in self.active_rooms[room_id]:
                if socket is not sendersocket:
                    await socket.send_text(content)

    async def broadcast_join_notif(self, content: dict, room_id: UUID, sendersocket: WebSocket):
        if room_id in self.active_rooms:
            for socket in self.active_rooms[room_id]:
                if socket is not sendersocket:
                    await socket.send_json(content)


    
connection_manager = ConnectionManager() 