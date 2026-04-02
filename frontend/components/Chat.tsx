'use client';

import { Send, BriefcaseBusiness, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import ProductCard from '@/components/ProductCard';

// Tool names that return product data
const PRODUCT_TOOLS = ['search_products', 'get_products_by_category'];

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto h-[80vh] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BriefcaseBusiness className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">Irad&apos;s AI Assistant</h2>
                        <p className="text-xs text-zinc-500">Your shopping assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-xs text-zinc-500">{isLoading ? 'Thinking...' : 'Online'}</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 opacity-50">
                        <BriefcaseBusiness className="w-12 h-12" />
                        <p>Ready to help. How can I assist you today?</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "flex items-start gap-3",
                                m.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                m.role === 'user' ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                            )}>
                                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>

                            <div className={cn(
                                "rounded-2xl max-w-[80%] text-sm leading-relaxed",
                                m.role === 'user'
                                    ? "px-4 py-2.5 bg-indigo-600 text-white rounded-tr-sm"
                                    : "bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/50"
                            )}>
                                {/* Text content */}
                                {m.content && (
                                    <div className={cn(
                                        m.role !== 'user' ? "px-4 py-2.5" : ""
                                    )}>
                                        {m.content}
                                    </div>
                                )}

                                {/* Tool invocations — product cards */}
                                {m.toolInvocations?.map((toolInvocation) => {
                                    if (!PRODUCT_TOOLS.includes(toolInvocation.toolName)) {
                                        return null;
                                    }

                                    if (toolInvocation.state === 'call' || toolInvocation.state === 'partial-call') {
                                        return (
                                            <div key={toolInvocation.toolCallId} className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                                    Searching for products...
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (toolInvocation.state === 'result') {
                                        const result = toolInvocation.result;
                                        const products = result?.products ?? [];

                                        if (products.length === 0) {
                                            return (
                                                <div key={toolInvocation.toolCallId} className="px-4 py-3 text-xs text-zinc-500">
                                                    No products found.
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={toolInvocation.toolCallId} className="p-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {products.slice(0, 4).map((product: any) => (
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

                                    return null;
                                })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        id="chat-input"
                        name="chat-input"
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your request..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}