'use client';

/**
 * ProductCard: The Visual Presentation Component.
 * A reusable UI card for individual products with branding, price logic, 
 * and framer-motion animations.
 * 
 * Now interacts with the global ProductModalContext for enlarged detail view.
 */


import { Package, Star, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProductModal, Product } from '@/context/ProductModalContext';

export interface ProductCardProps {
  title: string;
  price: number;
  description: string;
  imageUrl?: string;
  rating?: number;
  brand?: string;
  discountPercentage?: number;
  isPurchasable?: boolean;
}

export default function ProductCard({
  title,
  price,
  description,
  imageUrl,
  rating,
  brand,
  discountPercentage,
  isPurchasable = true
}: ProductCardProps) {
  const { openModal } = useProductModal();
  
  const discPrice = discountPercentage
    ? (price * (1 - discountPercentage / 100)).toFixed(2)
    : null;

  const handleCardClick = () => {
    // Construct the Product object from props to pass to the global modal
    const product: Product = {
      id: Math.random(), // In a real app we'd use the actual product ID
      title,
      price,
      description,
      imageUrl,
      rating,
      brand,
      discountPercentage,
      isPurchasable
    };
    openModal(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
      onClick={handleCardClick}
      className="group relative w-full rounded-2xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer backdrop-blur-sm"
    >
      {/* Image Wrapper */}
      <div className="relative aspect-square w-full bg-zinc-800/50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={`h-full w-full object-cover transition-transform duration-500 scale-100 group-hover:scale-110 ${!isPurchasable ? 'grayscale opacity-60' : ''}`}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-12 h-12 text-zinc-700" />
          </div>
        )}
        
        {discountPercentage && isPurchasable && (
          <div className="absolute top-3 left-3 bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20 shadow-lg">
            -{Math.round(discountPercentage)}%
          </div>
        )}

        {!isPurchasable && (
          <div className="absolute inset-0 z-10 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-2xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 space-y-3 ${!isPurchasable ? 'opacity-50' : ''}`}>
        <div className="flex flex-col gap-1">
          {brand && (
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-80">
              {brand}
            </span>
          )}
          <h3 className="text-sm font-bold text-zinc-100 leading-snug line-clamp-2 h-10">
            {title}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
          <div className="flex flex-col">
            <span className="text-lg font-black text-emerald-400">
              ${discPrice ?? price.toFixed(2)}
            </span>
            {discPrice && (
              <span className="text-[10px] text-zinc-600 line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {rating && (
            <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg px-2 py-1 border border-zinc-700/30">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-zinc-200 font-bold">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
