from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from .state import AgentState
from .nodes import agent_node, tool_node
from .edges import should_continue

# Initialize the stateful workflow using the AgentState schema
workflow = StateGraph(AgentState)

# Define the nodes (actions) that the graph can take
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

# Entry point: The graph always starts with the AI Agent
workflow.add_edge(START, "agent")

# Logic Gate: After the Agent speaks, decide if it needs to use a tool or finish
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",  # Go to tool execution if the model wants it
        "__end__": END     # Finish the conversation if no tool is needed
    }
)

# After a tool is finished, always return to the Agent to explain the result
workflow.add_edge("tools", "agent")

# Enable conversational memory (checkpointer)
memory = MemorySaver()

# Finalize the workflow into a runnable graph
graph = workflow.compile(checkpointer=memory)
