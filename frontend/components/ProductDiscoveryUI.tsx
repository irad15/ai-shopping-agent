'use client';

/**
 * ProductDiscoveryUI: The Generative UI Bridge.
 * Links the AI's product search tool calls to the visual ProductCard 
 * components using zod validation and Assistant UI tool rendering.
 */


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
  is_purchasable: z.boolean().optional().default(true),
});

const ProductResultSchema = z.object({
  products: z.array(ProductSchema).optional(),
});

type ProductArgs = {
  q?: string;    // search_products arg
  slug?: string; // get_products_by_category arg
};

type ProductResult = z.infer<typeof ProductResultSchema>;

/**
 * ProductResultGrid: The Visual Presentation Layer
 * 
 * This component looks at the current `status` (which comes from the 9: and a: prefixes)
 * and the `result` data to decide what to show the user.
 */
const ProductResultGrid = ({
  status,
  result
}: {
  // status.type is 'running' when the 9: prefix is received (Tool Call started)
  // status.type becomes 'complete' when the a: prefix is received (Tool Result arrived)
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

  // Once status is no longer 'running', we safely parse the 'a:' result payload
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
      {products.map((p) => (
        <ProductCard
          key={p.id}
          {...p}
          imageUrl={p.thumbnail}
          isPurchasable={p.is_purchasable}
        />
      ))}
    </div>
  );
};

/**
 * ToolUI Builder: The Integration Layer
 * 
 * This builds a listener component using `@assistant-ui/react`. 
 * It automatically matches the `toolCallId` from the backend stream.
 */
const ToolUI = ({ name }: { name: string }) => {
  const UI = makeAssistantToolUI<ProductArgs, ProductResult>({
    // 1. Matches the `toolName` emitted from the backend during the 9: stream event
    toolName: name,
    // 2. Automatically updates `status` (running/complete) and provides `result` 
    //    from the a: stream event by matching the hidden `toolCallId` natively.
    render: ({ status, result }) => (
      <ProductResultGrid status={status} result={result} />
    ),
  });
  return <UI />;
};

/**
 * Main ProductDiscoveryUI Component
 * 
 * We mount this component inside `ChatRuntimeProvider.tsx` so the Vercel API bridge
 * can discover it. We attach it to the specific function names that LangGraph uses.
 */
export const ProductDiscoveryUI = () => (
  <>
    <ToolUI name="search_products" />
    <ToolUI name="get_products_by_category" />
  </>
);
