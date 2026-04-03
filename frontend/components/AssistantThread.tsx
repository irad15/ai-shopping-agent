'use client';

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from '@assistant-ui/react';
import { Send, BriefcaseBusiness } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


function ChatMessage({
  role,
  children
}: {
  role: 'user' | 'assistant',
  children: React.ReactNode
}) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
        isUser ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
      )}>
        {isUser ? 'U' : 'AI'}
      </div>

      <MessagePrimitive.Root className={cn(
        'rounded-2xl max-w-[80%] text-sm leading-relaxed',
        isUser
          ? 'px-4 py-2.5 bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-zinc-800 text-zinc-200 border border-zinc-700/50'
      )}>
        <div className={cn(!isUser && 'px-4 py-2.5')}>
          {children}
        </div>
      </MessagePrimitive.Root>
    </motion.div>
  );
}

export function AssistantThread() {
  return (
    <ThreadPrimitive.Root className="flex flex-col w-full max-w-2xl mx-auto h-[80vh] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <BriefcaseBusiness className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Irad&apos;s AI Assistant</h2>
            <p className="text-xs text-zinc-500">Your shopping assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <ThreadPrimitive.If running>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Thinking...
          </ThreadPrimitive.If>

          <ThreadPrimitive.If running={false}>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Online
          </ThreadPrimitive.If>
        </div>
      </div>

      {/* Messages Viewport */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-6 space-y-6">
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 opacity-50 min-h-[300px]">
            <BriefcaseBusiness className="w-12 h-12" />
            <p>Ready to help. How can I assist you today?</p>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <ChatMessage role="user">
                <MessagePrimitive.Content />
              </ChatMessage>
            ),
            AssistantMessage: () => (
              <ChatMessage role="assistant">
                <MessagePrimitive.Content />
              </ChatMessage>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Input Composer */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <ComposerPrimitive.Root className="relative">
          <ComposerPrimitive.Input
            autoFocus
            placeholder="Type your request..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
          />
          <ComposerPrimitive.Send asChild>
            <button className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
              <Send size={16} />
            </button>
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}
