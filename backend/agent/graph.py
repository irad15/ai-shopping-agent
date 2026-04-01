from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from .state import AgentState
from .nodes import agent_node, tool_node
from .edges import should_continue

workflow = StateGraph(AgentState)

workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "__end__": END
    }
)
workflow.add_edge("tools", "agent")

memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)
