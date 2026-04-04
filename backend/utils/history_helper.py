import json
from typing import List, Dict, Any
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

def convert_state_messages_to_ui(state_messages: List[Any]) -> List[Dict[str, Any]]:
    """
    Translates LangChain message objects from the graph state into 
    Vercel AI SDK compatible UIMessage objects for the frontend.
    """
    ui_messages = []
    
    # 1. Collect tool results first (indexed by call ID)
    tool_results: Dict[str, Any] = {}
    for msg in state_messages:
        if isinstance(msg, ToolMessage):
            content = msg.content
            # Try to parse stringified JSON results back into objects
            if isinstance(content, str):
                try:
                    content = json.loads(content)
                except (json.JSONDecodeError, ValueError):
                    pass
            tool_results[msg.tool_call_id] = content

    # 2. Build the final UI message list
    for msg in state_messages:
        msg_id = getattr(msg, "id", None) or str(len(ui_messages))
        
        if isinstance(msg, HumanMessage):
            ui_messages.append({
                "id": msg_id,
                "role": "user",
                "content": str(msg.content) if msg.content else "",
            })
            
        elif isinstance(msg, AIMessage):
            # Process tool calls within the assistant message
            # For assistant-ui, history messages (ThreadMessageLike) expect tool calls to be
            # elements inside the 'content' array alongside text parts.
            content_parts = []
            
            # 1. Text part
            if msg.content and isinstance(msg.content, str):
                content_parts.append({
                    "type": "text",
                    "text": msg.content
                })
            
            # 2. Tool call parts
            if msg.tool_calls:
                for tc in msg.tool_calls:
                    tool_part = {
                        "type": "tool-call",
                        "toolCallId": tc["id"],
                        "toolName": tc["name"],
                        "args": tc.get("args", {}),
                    }
                    
                    # If this tool call has a result, attach it.
                    # Assistant-UI will implicitly treat it as 'complete'.
                    if tc["id"] in tool_results:
                        tool_part["result"] = tool_results[tc["id"]]
                        
                    content_parts.append(tool_part)
            
            ui_messages.append({
                "id": msg_id,
                "role": "assistant",
                # The crucial fix: 'content' must be an array of parts (text + tools)
                "content": content_parts if content_parts else "",
            })
            
        # ToolMessages are skipped here as their data was merged into the Assistant message above
            
    return ui_messages
