import json
from typing import List, Dict, Any
from langchain_core.messages import convert_to_messages

# Mock extract_content since it's in main.py
def extract_content(msg: Dict[str, Any]) -> str:
    content = msg.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return " ".join([p.get("text", "") for p in content if p.get("type") == "text"])
    return ""

def test_conversion(messages_data: List[Dict[str, Any]]):
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
                print(f"DEBUG: Skipping tool message with missing ID: {m}")
                continue
        else:
            langchain_msgs.append({"type": role if role else "human", "content": content})
            
    try:
        messages = convert_to_messages(langchain_msgs)
        print("SUCCESS: Conversion completed without crash.")
        for msg in messages:
            print(f"  {type(msg).__name__}: {msg.content[:50]}... (ID: {getattr(msg, 'tool_call_id', 'N/A')})")
    except Exception as e:
        print(f"FAILURE: {type(e).__name__}: {e}")

# Test Case: Multi-turn history with tool calls and results
history_with_tools = [
    {"role": "user", "content": "find laptops"},
    {
        "role": "assistant",
        "content": "Searching for laptops...",
        "toolInvocations": [
            {
                "toolCallId": "call_123",
                "toolName": "search_products",
                "args": {"q": "laptops"}
            }
        ]
    },
    {
        "role": "tool",
        "content": "Found 5 laptops",
        "toolCallId": "call_123"
    },
    {"role": "user", "content": "which is cheapest?"}
]

print("Running test with tool history...")
test_conversion(history_with_tools)
