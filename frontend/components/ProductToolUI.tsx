'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import ProductCard from '@/components/ProductCard';

type ProductArgs = {
  q?: string;    // search_products arg
  slug?: string; // get_products_by_category arg
};

type ProductResult = {
  products?: Array<{
    id: number;
    title: string;
    price: number;
    description: string;
    thumbnail?: string;
    rating?: number;
    brand?: string;
    discountPercentage?: number;
  }>;
};

function ProductResultGrid({ status, result }: { status: { type: string }; result?: ProductResult }) {
  if (status.type === 'running') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-xs text-zinc-400">
        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        Searching for products...
      </div>
    );
  }

  const products = result?.products ?? [];

  if (products.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-zinc-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-3">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            price={product.price}
            description={product.description}
            imageUrl={product.thumbnail}
            rating={product.rating}
            brand={product.brand}
            discountPercentage={product.discountPercentage}
          />
        ))}
      </div>
    </div>
  );
}

const SearchProductsToolUI = makeAssistantToolUI<ProductArgs, ProductResult>({
  toolName: 'search_products',
  render: ({ args, status, result }) => (
    <ProductResultGrid status={status} result={result} />
  ),
});

const GetProductsByCategoryToolUI = makeAssistantToolUI<ProductArgs, ProductResult>({
  toolName: 'get_products_by_category',
  render: ({ args, status, result }) => (
    <ProductResultGrid status={status} result={result} />
  ),
});

// Export a single component that registers both tool UIs inside the AssistantRuntimeProvider
export function ProductToolUI() {
  return (
    <>
      <SearchProductsToolUI />
      <GetProductsByCategoryToolUI />
    </>
  );
}
