import uuid
from fastapi import FastAPI
from app.routers import rooms, autocomplete, websocket
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def root():
    return {"message": "Hello World"}

app.include_router(rooms.router)
app.include_router(autocomplete.router)
app.include_router(websocket.router)