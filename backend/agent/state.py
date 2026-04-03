from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

# The AgentState defines the schema for the shared memory (the State) of the graph.
# Every node in the graph reads from and writes to this state.
class AgentState(TypedDict):
    # 'messages' stores the full conversation history.
    # The 'add_messages' annotation is a Reducer: it tells the graph to 
    # append new messages to the existing list instead of overwriting it.
    messages: Annotated[Sequence[BaseMessage], add_messages]
