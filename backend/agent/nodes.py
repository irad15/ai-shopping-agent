import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode
from services.client import DummyJSONClient
from .state import AgentState
from .tools import tools

# 1. Module-level cache for categories (Lazy-Loading Singleton)
_CACHED_CATEGORIES = None

async def _get_categories():
    """Helper to fetch categories once and cache them in memory."""
    global _CACHED_CATEGORIES
    if _CACHED_CATEGORIES is None:
        try:
            client = DummyJSONClient()
            _CACHED_CATEGORIES = await client.get_category_list()
        except Exception:
            _CACHED_CATEGORIES = []  # Fallback to empty list on error
    return _CACHED_CATEGORIES

llm = ChatOpenAI(model="gpt-5.4-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

tool_node = ToolNode(tools)

async def agent_node(state: AgentState):
    """The main agent node that calls the LLM."""
    messages = state["messages"]
    
    if not any(isinstance(m, SystemMessage) for m in messages):
        # 2. Fetch categories lazily (instantly from memory after the first call)
        categories = await _get_categories()
        category_str = ", ".join(categories) if categories else "standard product categories"
        
        sys_msg = SystemMessage(
            content=(
                "You are an expert Consultative Salesperson. Your goal is to help users find the perfect products while providing a premium shopping experience.\n\n"
                "### SALESMAN FRAMEWORK:\n"
                "1. DO NOT RUSH TO SEARCH: If a user's request is vague (e.g., 'I need a phone' or 'Looking for a gift'), do not immediately call a tool. "
                "Instead, ask 1-2 conversational questions to understand their specific needs (budget, brand preference, or use case).\n"
                "2. NEVER SUGGEST UNVERIFIED ITEMS: Do not ask if the user wants a specific product, style, or brand (e.g., 'Do you want loafers?') unless you have already fetched that exact item. Keep clarifying questions broad.\n"
                "3. AVOID INTERROGATIONS: Never ask more than 2 questions in a single turn.\n"
                "4. CONFIDENCE-BASED TOOL USE: Only trigger 'search_products' or 'get_products_by_category' when you have specific constraints or if the user explicitly asks to see options right away.\n"
                "5. CURATED PRESENTATION: When you fetch products, briefly explain how the group of results fits the user's criteria (e.g., 'I found some great options under your budget!'). Let the visual UI cards do the heavy lifting for specific item details—do not name specific products in your text.\n\n"
                "### TECHNICAL RULES:\n"
                f"- VALID CATEGORIES: {category_str}. Do not guess or hallucinate category names. If someone asks for a category name that is very similar to an existing one, use the existing one.\n"
                "- UI RENDERING: Product results are automatically displayed as visual cards. Do NOT repeat product details (names, prices, descriptions) in your text. Provide a friendly conversational summary instead.\n"
                "- ANTI-HALLUCINATION & API FALLBACKS: The `search_products` tool uses strict keyword matching. If it returns 'No products found', DO NOT immediately report a failure. Instead, attempt a broader fallback search using `get_products_by_category` for the most relevant valid category. Only inform the user an item is unavailable if both specific and fallback searches fail. Never make up products."
            )
        )
        messages = [sys_msg] + list(messages)
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}
