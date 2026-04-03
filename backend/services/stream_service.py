import json
import uuid
from typing import List, Dict, Any
from agent.graph import graph
from utils.message_converter import to_langchain_messages

async def stream_generator(messages_data: List[Dict[str, Any]]):
    """
    Acts as the bidirectional bridge between the Vercel AI SDK and the LangGraph agent.
    It translates incoming frontend messages into LangChain objects and reformats
    outgoing agent events into a streaming JSON protocol for the client.
    """
    # Unique identifier for the conversation session
    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}
    
    # Translate input data format to LangChain message objects
    langchain_messages = to_langchain_messages(messages_data)
    
    # Iterate through events produced by the LangGraph workflow
    async for event in graph.astream_events({"messages": langchain_messages}, config=config, version="v2"):
        kind = event["event"]
        
        # Capture and yield incremental text output from the chat model
        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield json.dumps({"type": "text", "content": chunk.content}) + "\n"
        
        # Detect completion of model turns and yield specific tool calls if present
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
        
        # Detect completion of tool execution and yield the result
        elif kind == "on_tool_end":
            output = event["data"]["output"]
            if hasattr(output, "tool_call_id"):
                result = output.content
                # Attempt to parse result strings back into structured data
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
