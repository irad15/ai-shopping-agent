import json
import uuid
from typing import List, Dict, Any
from agent.graph import graph
from utils.message_converter import to_langchain_messages

async def stream_generator(messages_data: List[Dict[str, Any]]):
    thread_id = str(uuid.uuid4()) 
    config = {"configurable": {"thread_id": thread_id}}
    
    langchain_messages = to_langchain_messages(messages_data)
    
    async for event in graph.astream_events({"messages": langchain_messages}, config=config, version="v2"):
        kind = event["event"]
        
        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield json.dumps({"type": "text", "content": chunk.content}) + "\n"
        
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
        
        elif kind == "on_tool_end":
            output = event["data"]["output"]
            if hasattr(output, "tool_call_id"):
                result = output.content
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
