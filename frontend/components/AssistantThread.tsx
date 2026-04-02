'use client';

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from '@assistant-ui/react';
import { Send, BriefcaseBusiness } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

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
        <div className="flex items-center gap-2">
          <ThreadPrimitive.If running>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs text-zinc-500">Thinking...</span>
          </ThreadPrimitive.If>
          <ThreadPrimitive.If running={false}>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500">Online</span>
          </ThreadPrimitive.If>
        </div>
      </div>

      {/* Messages area */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-6 space-y-6">
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 opacity-50 min-h-[300px]">
            <BriefcaseBusiness className="w-12 h-12" />
            <p>Ready to help. How can I assist you today?</p>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Input area */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <ComposerPrimitive.Root className="relative">
          <ComposerPrimitive.Input
            autoFocus
            placeholder="Type your request..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 resize-none"
          />
          <ComposerPrimitive.Send asChild>
            <button className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors">
              <Send size={16} />
            </button>
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}

function UserMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 flex-row-reverse"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-500/20 text-indigo-400 text-xs font-bold">
        U
      </div>
      <MessagePrimitive.Root className="px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed bg-indigo-600 text-white">
        <MessagePrimitive.Content />
      </MessagePrimitive.Root>
    </motion.div>
  );
}

function AssistantMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 flex-row"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 text-xs font-bold">
        AI
      </div>
      <MessagePrimitive.Root className={cn(
        'rounded-2xl rounded-tl-sm max-w-[80%] text-sm leading-relaxed',
        'bg-zinc-800 text-zinc-200 border border-zinc-700/50'
      )}>
        <div className="px-4 py-2.5">
          <MessagePrimitive.Content />
        </div>
      </MessagePrimitive.Root>
    </motion.div>
  );
}
