from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, Depends
from uuid import UUID
from app.manager import connection_manager
from app.database import AsyncSession
from app.dependencies import get_async_db
from sqlalchemy import update, select
from app import models

router = APIRouter(
    prefix="/ws/room"
)

@router.websocket("/{room_id}")
async def room_websocket(sender_websocket: WebSocket, room_id: UUID, db: AsyncSession = Depends(get_async_db)):
    is_connected = await connection_manager.connect(room_id, sender_websocket)
    current_state= None

    if not is_connected:
        await sender_websocket.accept()
        await sender_websocket.close(code=1013, reason=f"Room {room_id} is full (Max: {connection_manager.MAX_CAPACITY})")
        return
    await connection_manager.broadcast_join_notif({"joined": "new user joined"}, room_id, sender_websocket)
    
   
    query = select(models.Rooms.content).where(models.Rooms.id == room_id)
    result = await db.execute(query)
    old_content = result.scalar_one_or_none() 
    current_state = old_content if old_content is not None else ""

    if current_state:
        await sender_websocket.send_text(current_state)

    try:
        while True:
            data = await sender_websocket.receive_text()
            current_state = data
            # query = update(models.Rooms).where(models.Rooms.id == room_id).values(content=data)
            # res = await db.execute(query)
            # await db.commit()
            # print(f"Rows updated: {res.rowcount}")
            await connection_manager.broadcast(data, room_id, sender_websocket)
    except WebSocketDisconnect:
        query = update(models.Rooms).where(models.Rooms.id == room_id).values(content=current_state)
        res = await db.execute(query)
        await db.commit()
        print(f"Rows updated: {res.rowcount}")
        await connection_manager.disconnect(room_id, sender_websocket)
        await connection_manager.broadcast_join_notif({"left": "User left the room"}, room_id, sender_websocket)