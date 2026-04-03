'use client';

import { Package, Star, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ProductCardProps {
    title: string;
    price: number;
    description: string;
    imageUrl?: string;
    rating?: number;
    brand?: string;
    discountPercentage?: number;
}

export default function ProductCard({
  title,
  price,
  description,
  imageUrl,
  rating,
  brand,
  discountPercentage
}: ProductCardProps) {
  const discPrice = discountPercentage
    ? (price * (1 - discountPercentage / 100)).toFixed(2)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative w-full max-w-[280px] rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg hover:shadow-indigo-500/10 hover:border-zinc-700 transition-all"
    >
      <div className="relative h-40 w-full bg-zinc-800 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-10 h-10 text-zinc-600" />
          </div>
        )}
        {discountPercentage && (
          <div className="absolute top-2 right-2 bg-rose-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{Math.round(discountPercentage)}%
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-2">
        {brand && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider">
              {brand}
            </span>
          </div>
        )}

        <h3 className="text-sm font-semibold text-zinc-100 leading-tight line-clamp-2">
          {title}
        </h3>

        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between pt-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-emerald-400">
              ${discPrice ?? price.toFixed(2)}
            </span>
            {discPrice && (
              <span className="text-xs text-zinc-600 line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {rating && (
            <div className="flex items-center gap-1 bg-zinc-800 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-zinc-300 font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
