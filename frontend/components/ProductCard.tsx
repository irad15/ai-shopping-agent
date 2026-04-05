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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      className="group relative w-full max-w-[280px] rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer"
    >
      <div className="relative h-40 w-full bg-zinc-800 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={`h-full w-full object-cover transition-transform ${isPurchasable ? 'group-hover:scale-105' : ''}`}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-10 h-10 text-zinc-600" />
          </div>
        )}
        
        {discountPercentage && isPurchasable && (
          <div className="absolute top-2 right-2 bg-rose-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20">
            -{Math.round(discountPercentage)}%
          </div>
        )}

        {!isPurchasable && (
          <div className="absolute inset-0 z-10 bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 bg-zinc-100 text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-sm border border-white/20 shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className={`p-3.5 space-y-2 ${!isPurchasable ? 'opacity-40' : ''}`}>
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
            <div className="flex items-center gap-1 bg-zinc-800 rounded-full px-2 py-0.5 border border-zinc-700/50">
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
