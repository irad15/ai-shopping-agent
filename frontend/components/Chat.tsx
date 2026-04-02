'use client';

import { Send, BriefcaseBusiness, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Define our own simple Message type
type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

export default function Chat() {
    // 1. Simple State: No magic hooks, just data.
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        // Generate a random session ID on mount
        setSessionId(crypto.randomUUID());
    }, []);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 2. The Manual "Fetch" Function
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // A. Add User Message immediately
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };
        const assistantMsgId = (Date.now() + 1).toString();
        const assistantMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: ''
        };

        setMessages(prev => [...prev, userMsg, assistantMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // B. Send to Python Backend (Port 8000)
            const apiUrl = 'http://localhost:8000/chat';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                }),
            });

            if (!response.ok) throw new Error('Network error');

            // C. Read the Streaming Response
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                // Update the last message (the assistant's) with the new chunk
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsgIndex = newMessages.findIndex(m => m.id === assistantMsgId);
                    if (lastMsgIndex !== -1) {
                        newMessages[lastMsgIndex] = {
                            ...newMessages[lastMsgIndex],
                            content: accumulatedContent
                        };
                    }
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsgIndex = newMessages.findIndex(m => m.id === assistantMsgId);
                if (lastMsgIndex !== -1) {
                    newMessages[lastMsgIndex] = {
                        ...newMessages[lastMsgIndex],
                        content: "⚠️ Sorry, I can't reach the business server right now."
                    };
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto h-[80vh] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BriefcaseBusiness className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">Irad's AI Assistant</h2>
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
                                "px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed",
                                m.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-tr-sm"
                                    : "bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/50"
                            )}>
                                {m.content}
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
                        onChange={(e) => setInput(e.target.value)}
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