'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import ProductCard from '@/components/ProductCard';
import { z } from 'zod';

// Define Zod schemas for runtime validation
const ProductSchema = z.object({
  id: z.number(),
  title: z.string().default('Untitled Product'),
  price: z.number().default(0),
  description: z.string().default(''),
  thumbnail: z.string().optional(),
  rating: z.number().optional(),
  brand: z.string().optional(),
  discountPercentage: z.number().optional(),
});

const ProductResultSchema = z.object({
  products: z.array(ProductSchema).optional(),
});

type ProductArgs = {
  q?: string;    // search_products arg
  slug?: string; // get_products_by_category arg
};

type ProductResult = z.infer<typeof ProductResultSchema>;

function ProductResultGrid({ status, result }: { status: { type: string }; result?: any }) {
  if (status.type === 'running') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-xs text-zinc-400">
        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        Searching for products...
      </div>
    );
  }

  // Runtime validation using Zod
  const validation = ProductResultSchema.safeParse(result);

  if (!validation.success) {
    console.error('Malformed product data:', validation.error);
    return (
      <div className="px-4 py-3 text-xs text-red-400 bg-red-400/10 rounded-lg border border-red-400/20 mx-3">
        Error: Received malformed product data from the agent.
      </div>
    );
  }

  const products = validation.data.products ?? [];

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
