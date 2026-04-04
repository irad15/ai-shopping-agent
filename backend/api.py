import os
import json
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.checkpoint.memory import MemorySaver

from services.stream_service import stream_generator
from agent.graph import workflow
from utils.history_helper import convert_state_messages_to_ui

# --- 1. Models & Schemas ---

class ChatRequest(BaseModel):
    thread_id: str
    messages: List[Dict[str, Any]]

# --- 2. App Lifecycle (Startup/Shutdown) ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the initialization and cleanup of deep-state dependencies like 
    Database Connection Pools, Checkpointers, and Compiled Agents.
    """
    if db_url := os.getenv("DATABASE_URL"):
        try:
            # 1. Initialize Postgres Connection Pool
            pool = AsyncConnectionPool(db_url, kwargs={"autocommit": True}, open=False)
            await pool.open(timeout=3.0)
            
            # 2. Setup LangGraph Postgres Checkpointer
            app.state.checkpointer = AsyncPostgresSaver(pool)
            await app.state.checkpointer.setup()
            app.state.pool = pool
            print("✅ Postgres Checkpointer Ready.")
        except Exception as e:
            print(f"❌ Postgres Connection Failed ({e}).")
            if 'pool' in locals() and not pool.closed:
                await pool.close()
            raise RuntimeError("Database startup failed.") from e
    else:
        # Fallback to in-memory storage if no DB_URL is provided
        print("🧠 No DATABASE_URL. Using MemorySaver.")
        app.state.pool, app.state.checkpointer = None, MemorySaver()
        
    # 3. Compile the agent ONCE matching the checkpointer
    app.state.agent = workflow.compile(checkpointer=app.state.checkpointer)
    
    yield
    
    # Gracefully close DB connections on shutdown
    if getattr(app.state, "pool", None):
        await app.state.pool.close()

# --- 3. App Initialization ---

app = FastAPI(
    title="AI Shopping Agent API",
    description="A resilient, stateful backend for an AI-powered shopping assistant.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- 4. API Endpoints ---

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "AI Shopping Agent"}

@app.get("/history/{thread_id}")
async def get_history(thread_id: str, fast_req: Request):
    """
    Retrieves the full conversation history for a given thread_id.
    Uses the history_helper to translate LangGraph state into UI-compatible messages.
    """
    try:
        agent = fast_req.app.state.agent
        config = {"configurable": {"thread_id": thread_id}}
        state = await agent.aget_state(config)
        
        # If no state exists for this thread, return empty
        if not state or not state.values or "messages" not in state.values:
            return JSONResponse(content={"messages": []})
        
        # Clean helper translation from LangChain -> UI Messages
        messages = convert_state_messages_to_ui(state.values["messages"])
        return JSONResponse(content={"messages": messages})

    except Exception:
        # Silently handle history fetch failures to avoid crashing the whole chat
        return JSONResponse(content={"messages": []}, status_code=200)

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, fast_req: Request):
    """
    Handles streaming chat requests.
    Bridges backend events to the Vercel AI SDK protocol via stream_generator.
    """
    try:
        # Log incoming user message for debugging
        if request.messages: 
            print(f"Incoming: {request.messages[-1].get('content')}")
        
        agent = fast_req.app.state.agent
        
        return StreamingResponse(
            stream_generator(agent, request.thread_id, request.messages), 
            media_type="text/plain"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
