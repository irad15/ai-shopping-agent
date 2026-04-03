import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.checkpoint.memory import MemorySaver
from services.stream_service import stream_generator
from agent.graph import workflow

class ChatRequest(BaseModel):
    thread_id: str
    messages: List[Dict[str, Any]]

@asynccontextmanager
async def lifespan(app: FastAPI):
    if db_url := os.getenv("DATABASE_URL"):
        try:
            pool = AsyncConnectionPool(db_url, kwargs={"autocommit": True}, open=False)
            await pool.open(timeout=3.0)
            app.state.checkpointer = AsyncPostgresSaver(pool)
            await app.state.checkpointer.setup()
            app.state.pool = pool
            print("✅ Postgres Checkpointer Ready.")
        except Exception as e:
            print(f"⚠️ Postgres Connection Failed ({e}). Using MemorySaver.")
            app.state.pool, app.state.checkpointer = None, MemorySaver()
    else:
        print("🧠 No DATABASE_URL. Using MemorySaver.")
        app.state.pool, app.state.checkpointer = None, MemorySaver()
    
    yield
    
    if getattr(app.state, "pool", None):
        await app.state.pool.close()

app = FastAPI(title="AI Shopping Agent API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
async def root(): return {"status": "ok"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, fast_req: Request):
    try:
        if request.messages: print(f"Incoming: {request.messages[-1].get('content')}")
        agent = workflow.compile(checkpointer=fast_req.app.state.checkpointer)
        return StreamingResponse(stream_generator(agent, request.thread_id, request.messages), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
