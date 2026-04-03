from typing import List, Dict, Any
from langchain_core.messages import convert_to_messages

def extract_content(msg: Dict[str, Any]) -> str:
    """Extract text content from a message in multiple formats:
    - v3 string: { role, content: "Hello" }
    - content array: { role, content: [{ type: "text", text: "Hello" }] }
    - parts array: { role, parts: [{ type: "text", text: "Hello" }] }
    """
    content = msg.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for part in content:
            if isinstance(part, dict) and part.get("type") == "text":
                texts.append(part.get("text", ""))
        return " ".join(texts)
    parts = msg.get("parts")
    if isinstance(parts, list):
        texts = []
        for part in parts:
            if isinstance(part, dict) and part.get("type") == "text":
                texts.append(part.get("text", ""))
        return " ".join(texts)
    return ""

def to_langchain_messages(messages_data: List[Dict[str, Any]]):
    """Converts Vercel AI SDK / assistant-ui message formats to LangChain messages."""
    langchain_msgs = []
    for m in messages_data:
        role = m.get("role")
        content = extract_content(m)
        
        if role == "user":
            langchain_msgs.append({"type": "human", "content": content})
            
        elif role == "assistant":
            tool_calls = []
            if "toolInvocations" in m:
                for ti in m["toolInvocations"]:
                    tc_id = ti.get("toolCallId") or ti.get("id") or ti.get("tool_call_id")
                    if tc_id:
                        tool_calls.append({
                            "id": tc_id,
                            "name": ti.get("toolName") or ti.get("name"),
                            "args": ti.get("args") or {}
                        })
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
            tc_id = m.get("toolCallId") or m.get("id") or m.get("tool_call_id")
            if tc_id:
                langchain_msgs.append({
                    "type": "tool",
                    "content": content,
                    "tool_call_id": tc_id
                })
            else:
                continue
                
        else:
            langchain_msgs.append({"type": role if role else "human", "content": content})
            
    return convert_to_messages(langchain_msgs)
