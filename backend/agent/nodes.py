import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode
from .state import AgentState
from .tools import tools

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

tool_node = ToolNode(tools)

def agent_node(state: AgentState):
    """The main agent node that calls the LLM."""
    messages = state["messages"]
    
    if not any(isinstance(m, SystemMessage) for m in messages):
        sys_msg = SystemMessage(
            content="You are a helpful BazaK shopping assistant. Help the user find products and browse categories using the provided tools."
        )
        messages = [sys_msg] + list(messages)
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}
