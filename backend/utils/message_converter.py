from typing import List, Dict, Any
from langchain_core.messages import convert_to_messages


def to_langchain_messages(messages_data: List[Dict[str, Any]]):
    """
    Converts a list of message dictionaries (from Vercel AI SDK or assistant-ui)
    into a list of official LangChain message objects.
    """
    langchain_msgs = []
    
    for m in messages_data:
        role = m.get("role")
        content = extract_content(m)
        
        # User messages map to 'human' type
        if role == "user":
            langchain_msgs.append({"type": "human", "content": content})
            
        # Assistant messages map to 'ai' type and may include tool calls
        elif role == "assistant":
            tool_calls = []
            
            # Check for 'toolInvocations' (Vercel style)
            if "toolInvocations" in m:
                for ti in m["toolInvocations"]:
                    # Normalize various ID field names
                    tc_id = ti.get("toolCallId") or ti.get("id") or ti.get("tool_call_id")
                    if tc_id:
                        tool_calls.append({
                            "id": tc_id,
                            "name": ti.get("toolName") or ti.get("name"),
                            "args": ti.get("args") or {}
                        })
                        
            # Check for standard 'tool_calls'
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
            
        # Tool results map to 'tool' type and must include the original tool_call_id
        elif role == "tool":
            tc_id = m.get("toolCallId") or m.get("id") or m.get("tool_call_id")
            if tc_id:
                langchain_msgs.append({
                    "type": "tool",
                    "content": content,
                    "tool_call_id": tc_id
                })
            else:
                # Skip tool results without a valid ID to avoid graph errors
                continue
                
        else:
            # Fallback for system messages or other roles
            langchain_msgs.append({"type": role if role else "human", "content": content})
            
    # Use LangChain utility to finalize the conversion to message objects
    return convert_to_messages(langchain_msgs)


def extract_content(msg: Dict[str, Any]) -> str:
    """
    Extracts text content from a message dictionary.
    Handles multiple formats used by different SDKs:
    - Standard string content
    - Content arrays (e.g., Vercel AI SDK v3)
    - Part arrays (e.g., multimodal inputs)
    """
    content = msg.get("content")
    
    # Handle direct string content
    if isinstance(content, str):
        return content
        
    # Handle content arrays where text is nested in objects
    if isinstance(content, list):
        texts = []
        for part in content:
            if isinstance(part, dict) and part.get("type") == "text":
                texts.append(part.get("text", ""))
        return " ".join(texts)
        
    # Handle 'parts' array format
    parts = msg.get("parts")
    if isinstance(parts, list):
        texts = []
        for part in parts:
            if isinstance(part, dict) and part.get("type") == "text":
                texts.append(part.get("text", ""))
        return " ".join(texts)
        
    return ""