import uuid
from sqlalchemy import Column, UUID, Text, DateTime
from app.database import Base
from datetime import datetime


class Rooms(Base):
    __tablename__ = 'rooms'

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.now())
