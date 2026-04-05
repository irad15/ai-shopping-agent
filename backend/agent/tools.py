from langchain_core.tools import tool
from services.client import DummyJSONClient

dummy_client = DummyJSONClient()

def _process_products(data: dict) -> dict:
    """Helper to enforce strict business rules on product results."""
    products = data.get("products", [])
    for p in products:
        # 1. Calculate purchasability: stock must be >= minimumOrderQuantity
        stock = p.get("stock", 0)
        min_qty = p.pop("minimumOrderQuantity", 1)  # Remove field so LLM doesn't see it!
        p["is_purchasable"] = stock >= min_qty

        # 2. SANITIZE REVIEWS: Keep only rating and comment for token efficiency
        reviews = p.get("reviews", [])
        p["reviews"] = [
            {"rating": r.get("rating"), "comment": r.get("comment")}
            for r in reviews
        ]
        
    return data

@tool
async def search_products(q: str, limit: int = 10, skip: int = 0) -> dict:
    """
    Search for products using a query string. 
    Use 'limit' to control the number of results and 'skip' for pagination (to see more results).
    """
    try:
        # Business rule: cap max results to 10 for performance
        limit = min(limit, 10)
        result = await dummy_client.search_products(q, limit=limit, skip=skip)
        
        if not result.get("products"):
            return f"No products found for '{q}'."
            
        return _process_products(result)
    except Exception as e:
        return f"Error searching for products: {str(e)}"

@tool
async def get_products_by_category(slug: str, limit: int = 10, skip: int = 0) -> dict:
    """
    Get products for a specific category using its slug.
    Use 'limit' to control the number of results and 'skip' for pagination (to see more results).
    """
    try:
        # Business rule: cap max results to 10 for performance
        limit = min(limit, 10)
        result = await dummy_client.get_products_by_category(slug, limit=limit, skip=skip)
        
        if not result.get("products"):
            return f"No products found for category '{slug}'."
            
        return _process_products(result)
    except Exception as e:
        return f"Error fetching category {slug}: {str(e)}"

tools = [search_products, get_products_by_category]
