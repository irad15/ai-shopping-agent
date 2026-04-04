'use client';

/**
 * ChatRuntimeProvider: The Logic Engine.
 * Manages AI runtime initialization, session persistence (thread_id),
 * and handles the global state for the AI conversation.
 * 
 * On page load, it fetches the full conversation history from PostgreSQL
 * so the chat UI is restored with all previous messages and product cards.
 */


import { useEffect, useState } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useDataStreamRuntime } from '@assistant-ui/react-data-stream';
import { ChatInterface } from '@/components/ChatInterface';
import { ProductDiscoveryUI } from '@/components/ProductDiscoveryUI';
import { v4 as uuidv4 } from 'uuid';

export function ChatRuntimeProvider() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we already have a thread in this browser session
    const savedThread = localStorage.getItem('chat_thread_id');
    let currentThreadId: string;

    if (savedThread) {
      currentThreadId = savedThread;
    } else {
      // If not, create a new one securely and save it
      currentThreadId = uuidv4();
      localStorage.setItem('chat_thread_id', currentThreadId);
    }

    setThreadId(currentThreadId);

    // Fetch the conversation history from PostgreSQL to restore the session
    fetch(`/api/history?thread_id=${currentThreadId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          setInitialMessages(data.messages);
        } else {
          setInitialMessages(undefined);
        }
      })
      .catch(() => {
        // If history fetch fails, start fresh (no crash)
        setInitialMessages(undefined);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /**
   * Initialize the AI Runtime using the Vercel Data Stream Protocol.
   * We attach the `thread_id` to the request body so the proxy forwards it.
   * If we have restored history, we pass it as `initialMessages` so the
   * chat UI is pre-populated with previous messages and product cards.
   */
  const runtime = useDataStreamRuntime({
    api: '/api/chat',
    protocol: 'data-stream',
    body: {
      thread_id: threadId,
    },
    initialMessages,
  });

  // Wait until we have established a thread ID and finished loading history
  if (!threadId || isLoading) return null;

  return (
    /**
     * Provide the runtime context to all child components.
     * This allows components like ChatInterface and ProductDiscoveryUI to access
     * and interact with the AI conversation state.
     */
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatInterface />
      {/* Tool UIs must be inside the provider to access runtime context */}
      <ProductDiscoveryUI />
    </AssistantRuntimeProvider>
  );
}
