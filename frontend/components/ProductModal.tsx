'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Tag, Package, ShoppingCart } from 'lucide-react';
import { useProductModal } from '@/context/ProductModalContext';

/**
 * Global ProductModal Component.
 * Handled via ProductModalContext to prevent DOM bloat.
 * Features: Accessibility (Escape key), Scroll Lock, 
 * and a premium midsize layout.
 */
export function ProductModal() {
  const { selectedProduct, closeModal } = useProductModal();

  // 1. Accessibility: Keyboard Listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (selectedProduct) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, closeModal]);

  // 2. UX: Body Scroll Lock
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const {
    title,
    price,
    description,
    imageUrl,
    rating,
    brand,
    discountPercentage,
    isPurchasable = true
  } = selectedProduct;

  const discPrice = discountPercentage
    ? (price * (1 - discountPercentage / 100)).toFixed(2)
    : null;

  return (
    <AnimatePresence>
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-10 md:p-20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl cursor-zoom-out"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-h-[85vh]"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors border border-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Image Section */}
            <div className="w-full md:w-1/2 relative bg-zinc-800 aspect-square md:aspect-auto">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className={`h-full w-full object-cover ${!isPurchasable ? 'grayscale opacity-50' : ''}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-16 h-16 text-zinc-600" />
                </div>
              )}

              {!isPurchasable && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40">
                  <span className="px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-black uppercase tracking-widest rounded-sm">
                    Out of Stock
                  </span>
                </div>
              )}

              {discountPercentage && isPurchasable && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  -{Math.round(discountPercentage)}% OFF
                </div>
              )}
            </div>

            {/* Right: Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  {brand && (
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                      {brand}
                    </span>
                  )}
                  <h2 id="modal-title" className="text-3xl font-black text-zinc-50 leading-tight">
                    {title}
                  </h2>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-emerald-400 tracking-tighter">
                      ${discPrice ?? price.toFixed(2)}
                    </span>
                    {discPrice && (
                      <span className="text-sm text-zinc-500 line-through font-medium">
                        Original: ${price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {rating && (
                    <div className="flex items-center gap-2 bg-zinc-900 rounded-2xl px-4 py-2 border border-zinc-800">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-base text-zinc-100 font-bold">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-800/50 space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product Overview</h4>
                  <p className="text-base text-zinc-400 leading-relaxed font-medium">
                    {description}
                  </p>
                </div>
              </div>

              {/* Action Section */}
              <div className="pt-10">
                <button
                  disabled={!isPurchasable}
                  className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${isPurchasable
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_20px_50px_rgba(79,70,229,0.2)] active:scale-[0.98]'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {isPurchasable ? 'Add to Cart' : 'Currently Out of Stock'}
                </button>
                {isPurchasable && (
                  <p className="text-center mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Free shipping on orders over $50
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
