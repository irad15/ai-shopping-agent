from typing import Literal
from .state import AgentState

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """Return the next node to execute."""
    last_message = state["messages"][-1]
    
    if last_message.tool_calls:
        return "tools"
    
    return "__end__"
