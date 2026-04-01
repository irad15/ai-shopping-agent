import requests
from langchain_core.tools import tool

@tool
def search_products(q: str) -> dict:
    """Search for products using a query string."""
    response = requests.get(f"https://dummyjson.com/products/search?q={q}")
    response.raise_for_status()
    return response.json()

@tool
def get_products_by_category(slug: str) -> dict:
    """Get products for a specific category using its slug."""
    response = requests.get(f"https://dummyjson.com/products/category/{slug}")
    response.raise_for_status()
    return response.json()

tools = [search_products, get_products_by_category]
