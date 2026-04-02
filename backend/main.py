from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from agent.graph import graph
import json
import uuid
from langchain_core.messages import convert_to_messages

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]

def extract_content(msg: Dict[str, Any]) -> str:
    """Extract text content from a message in either v3 ({role, content}) or v6 ({role, parts}) format."""
    # v3 format: { role: "user", content: "Hello" }
    if "content" in msg and isinstance(msg["content"], str):
        return msg["content"]
    # v6 format: { role: "user", parts: [{ type: "text", text: "Hello" }] }
    if "parts" in msg:
        texts = []
        for part in msg["parts"]:
            if isinstance(part, dict) and part.get("type") == "text":
                texts.append(part.get("text", ""))
        return " ".join(texts)
    return ""

async def stream_generator(messages_data: List[Dict[str, Any]]):
    thread_id = str(uuid.uuid4()) 
    config = {"configurable": {"thread_id": thread_id}}
    
    langchain_msgs = []
    for m in messages_data:
        role = m.get("role")
        content = extract_content(m)
        if role == "user":
            langchain_msgs.append({"type": "human", "content": content})
        elif role == "assistant":
            langchain_msgs.append({"type": "ai", "content": content})
        else:
            langchain_msgs.append({"type": role, "content": content})
            
    langchain_messages = convert_to_messages(langchain_msgs)
    
    async for event in graph.astream_events({"messages": langchain_messages}, config=config, version="v2"):
        if event["event"] == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield chunk.content

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        stream_generator(request.messages),
        media_type="text/plain"
    )
