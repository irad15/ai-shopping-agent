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
    """Extract text content from a message in multiple formats:
    - v3 string: { role, content: "Hello" }
    - content array: { role, content: [{ type: "text", text: "Hello" }] }  <- assistant-ui format
    - parts array: { role, parts: [{ type: "text", text: "Hello" }] }
    """
    content = msg.get("content")
    # String content
    if isinstance(content, str):
        return content
    # Content as a list of parts (assistant-ui / AI SDK format)
    if isinstance(content, list):
        texts = []
        for part in content:
            if isinstance(part, dict) and part.get("type") == "text":
                texts.append(part.get("text", ""))
        return " ".join(texts)
    # Legacy parts key
    parts = msg.get("parts")
    if isinstance(parts, list):
        texts = []
        for part in parts:
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
            # Extract tool calls from both 'toolInvocations' (Vercel) and 'tool_calls' (Standard)
            tool_calls = []
            
            # 1. Check for Vercel toolInvocations
            if "toolInvocations" in m:
                for ti in m["toolInvocations"]:
                    tc_id = ti.get("toolCallId") or ti.get("id") or ti.get("tool_call_id")
                    if tc_id:
                        tool_calls.append({
                            "id": tc_id,
                            "name": ti.get("toolName") or ti.get("name"),
                            "args": ti.get("args") or {}
                        })
            
            # 2. Check for standard tool_calls
            elif "tool_calls" in m and isinstance(m["tool_calls"], list):
                for tc in m["tool_calls"]:
                    tc_id = tc.get("id") or tc.get("tool_call_id")
                    if tc_id:
                        tool_calls.append({
                            "id": tc_id,
                            "name": tc.get("name"),
                            "args": tc.get("args") or {}
                        })
            
            langchain_msgs.append({
                "type": "ai", 
                "content": content,
                "tool_calls": tool_calls if tool_calls else None
            })
            
        elif role == "tool":
            # Tool messages MUST have a valid ID. Try all common keys.
            tc_id = m.get("toolCallId") or m.get("id") or m.get("tool_call_id")
            if tc_id:
                langchain_msgs.append({
                    "type": "tool",
                    "content": content,
                    "tool_call_id": tc_id
                })
            else:
                # If we have role: "tool" but no ID, we MUST skip it to avoid KeyError in LangChain
                print(f"WARNING: Skipping tool message with missing ID: {m}")
                continue
                
        else:
            # Fallback for system or unknown roles
            langchain_msgs.append({"type": role if role else "human", "content": content})
            
    langchain_messages = convert_to_messages(langchain_msgs)
    
    async for event in graph.astream_events({"messages": langchain_messages}, config=config, version="v2"):
        kind = event["event"]
        
        # 1. Stream text chunks from the LLM
        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield json.dumps({"type": "text", "content": chunk.content}) + "\n"
        
        # 2. Detect tool calls when the LLM finishes a generation step
        elif kind == "on_chat_model_end":
            msg = event["data"]["output"]
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    yield json.dumps({
                        "type": "tool_call",
                        "toolCallId": tc["id"],
                        "toolName": tc["name"],
                        "args": tc["args"],
                    }) + "\n"
        
        # 3. Emit tool results when a tool finishes execution
        elif kind == "on_tool_end":
            output = event["data"]["output"]
            # ToolMessage from LangChain's ToolNode
            if hasattr(output, "tool_call_id"):
                result = output.content
                # Parse stringified JSON back to a dict
                if isinstance(result, str):
                    try:
                        result = json.loads(result)
                    except (json.JSONDecodeError, ValueError):
                        pass
                yield json.dumps({
                    "type": "tool_result",
                    "toolCallId": output.tool_call_id,
                    "result": result,
                }) + "\n"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        stream_generator(request.messages),
        media_type="text/plain"
    )

