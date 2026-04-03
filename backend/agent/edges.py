from typing import Literal
from .state import AgentState

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """
    Determines the next node in the graph based on the last message in the state.
    """
    # Retrieve the most recent message from the conversation history
    last_message = state["messages"][-1]
    
    # If the chat model requested the use of a tool, proceed to the 'tools' node
    if last_message.tool_calls:
        return "tools"
    
    # If no tool calls are present, the conversation is complete
    return "__end__"
