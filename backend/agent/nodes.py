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
            content=(
                "You are a helpful shopping assistant. Help the user find products and browse categories using the provided tools. "
                "IMPORTANT: When you call a tool like search_products or get_products_by_category, the product results are automatically "
                "displayed as visual product cards in the user interface. Do NOT list or repeat the product details (names, prices, descriptions, "
                "images, stock, etc.) in your text response. Instead, provide only a brief, friendly conversational summary like "
                "'Here are some results I found for you!' or 'I found a few options — take a look!' "
                "You may offer to help further, filter, or answer questions about the products."
            )
        )
        messages = [sys_msg] + list(messages)
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}
