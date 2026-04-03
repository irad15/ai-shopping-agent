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

const ProductResultGrid = ({ 
  status, 
  result 
}: { 
  status: { type: string }; 
  result?: any 
}) => {
  if (status.type === 'running') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-xs text-zinc-400">
        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        Searching...
      </div>
    );
  }

  const val = ProductResultSchema.safeParse(result);
  if (!val.success) return null;

  const products = val.data.products ?? [];
  
  if (!products.length) {
    return (
      <div className="px-4 py-3 text-xs text-zinc-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="p-3 grid grid-cols-2 gap-3">
      {products.slice(0, 4).map((p) => (
        <ProductCard 
          key={p.id} 
          {...p} 
          imageUrl={p.thumbnail} 
        />
      ))}
    </div>
  );
};

const ToolUI = ({ name }: { name: string }) => {
  const UI = makeAssistantToolUI<ProductArgs, ProductResult>({
    toolName: name,
    render: ({ status, result }) => (
      <ProductResultGrid status={status} result={result} />
    ),
  });
  return <UI />;
};

export const ProductToolUI = () => (
  <>
    <ToolUI name="search_products" />
    <ToolUI name="get_products_by_category" />
  </>
);
