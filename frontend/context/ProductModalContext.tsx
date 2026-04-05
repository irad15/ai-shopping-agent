'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Product Interface: Matches the backend/DummyJSON schema 
 * and what is expected by the ProductCard.
 */
export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    imageUrl?: string;
    rating?: number;
    brand?: string;
    discountPercentage?: number;
    isPurchasable?: boolean;
}

interface ProductModalContextType {
    selectedProduct: Product | null;
    openModal: (product: Product) => void;
    closeModal: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export function ProductModalProvider({ children }: { children: ReactNode }) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const openModal = (product: Product) => setSelectedProduct(product);
    const closeModal = () => setSelectedProduct(null);

    return (
        <ProductModalContext.Provider value={{ selectedProduct, openModal, closeModal }}>
            {children}
        </ProductModalContext.Provider>
    );
}

export function useProductModal() {
    const context = useContext(ProductModalContext);
    if (!context) {
        throw new Error('useProductModal must be used within a ProductModalProvider');
    }
    return context;
}
