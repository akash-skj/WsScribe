from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_async_db
from app import models

router = APIRouter(
    prefix="/rooms"
)

@router.post("/")
async def create_room(db: AsyncSession = Depends(get_async_db)):
    room = models.Rooms()
    try:
        db.add(room)
        await db.commit()
        await db.refresh(room)
        return room
    except Exception as e: 
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/")
async def get_rooms(db: AsyncSession = Depends(get_async_db)):
    try:
        query = select(models.Rooms)
        res = await db.execute(query)
        rooms = res.scalars().all()
        # print(rooms)
        return rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))