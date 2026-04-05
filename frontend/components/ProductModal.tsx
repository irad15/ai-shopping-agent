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
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <div className="flex-1 space-y-4">
                {brand && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                      {brand}
                    </span>
                  </div>
                )}

                <h2 id="modal-title" className="text-2xl font-bold text-zinc-100 leading-tight">
                  {title}
                </h2>

                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-400">
                      ${discPrice ?? price.toFixed(2)}
                    </span>
                    {discPrice && (
                      <span className="text-lg text-zinc-600 line-through">
                        ${price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {rating && (
                    <div className="flex items-center gap-1.5 bg-zinc-800/80 rounded-full px-3 py-1 border border-zinc-700">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-zinc-100 font-bold">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              {/* Action Section */}
              <div className="pt-8">
                <button
                  disabled={!isPurchasable}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/10 ${isPurchasable
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-[0.98]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isPurchasable ? 'Add to Cart' : 'Currently Out of Stock'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
