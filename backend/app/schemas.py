from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class RoomCreate(BaseModel):
    pass

class RoomResponse(BaseModel):
    id: UUID
    content: str

class AutocompleteRequest(BaseModel):
    code_context: str
    cursor_line: int
    cursor_column: int
    language: str

class AutocompleteResponse(BaseModel):
    suggestion: str
