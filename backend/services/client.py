import httpx

class DummyJSONClient:
    BASE_URL = "https://dummyjson.com"

    async def _get(self, url: str, params: dict = None) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    async def search_products(self, q: str, limit: int = 10, skip: int = 0) -> dict:
        return await self._get(f"{self.BASE_URL}/products/search", params={"q": q, "limit": limit, "skip": skip})

    async def get_products_by_category(self, slug: str, limit: int = 10, skip: int = 0) -> dict:
        return await self._get(f"{self.BASE_URL}/products/category/{slug}", params={"limit": limit, "skip": skip})

    async def get_category_list(self) -> list:
        return await self._get(f"{self.BASE_URL}/products/category-list")
