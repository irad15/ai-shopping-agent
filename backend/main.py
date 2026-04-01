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

async def stream_generator(messages_data: List[Dict[str, Any]]):
    thread_id = str(uuid.uuid4()) 
    config = {"configurable": {"thread_id": thread_id}}
    
    # ai sdk sends 'user' or 'assistant'. convert_to_messages works if it is 'human' or 'ai', 
    # but also supports 'user' and 'assistant' in recent langchain versions, assuming role structure.
    # To be safe, we convert role to langchain type.
    langchain_msgs = []
    for m in messages_data:
        role = m.get("role")
        content = m.get("content")
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
                yield f'0:{json.dumps(chunk.content)}\n'

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        stream_generator(request.messages),
        media_type="text/plain"
    )
