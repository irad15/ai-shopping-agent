from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from services.stream_service import stream_generator

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Shopping Agent API"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        stream_generator(request.messages),
        media_type="text/plain"
    )
