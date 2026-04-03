from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from services.stream_service import stream_generator

# The standard communication object containing the message history.
# It acts as the shared context for the user, assistant, and tools to communicate.
class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]

# Initialize the FastAPI application
app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing)
# This allows the Next.js frontend to talk to this Python server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint for health checks
@app.get("/")
async def root():
    return {"status": "ok", "message": "AI Shopping Agent API"}

# Main chat endpoint that manages the AI agent's streaming response
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    # StreamingResponse allows us to send the AI's thoughts as they are generated
    # instead of making the user wait for the entire response.
    return StreamingResponse(
        stream_generator(request.messages),
        media_type="text/plain"
    )
