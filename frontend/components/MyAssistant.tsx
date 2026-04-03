'use client';

import { useEffect, useState } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useDataStreamRuntime } from '@assistant-ui/react-data-stream';
import { AssistantThread } from '@/components/AssistantThread';
import { ProductToolUI } from '@/components/ProductToolUI';
import { v4 as uuidv4 } from 'uuid';

export function MyAssistant() {
  // State to hold our persistent conversation ID
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    // Check if we already have a thread in this browser session
    const savedThread = localStorage.getItem('chat_thread_id');
    if (savedThread) {
      setThreadId(savedThread);
    } else {
      // If not, create a new one securely and save it
      const newThread = uuidv4();
      localStorage.setItem('chat_thread_id', newThread);
      setThreadId(newThread);
    }
  }, []);

  /**
   * Initialize the AI Runtime using the Vercel Data Stream Protocol.
   * We attach the `thread_id` to the request body so the proxy forwards it.
   */
  const runtime = useDataStreamRuntime({
    api: '/api/chat',
    protocol: 'data-stream',
    body: {
      thread_id: threadId,
    },
  });

  // Wait until we have established a thread ID to prevent crash
  if (!threadId) return null;

  return (
    /**
     * Provide the runtime context to all child components.
     * This allows components like AssistantThread and ProductToolUI to access 
     * and interact with the AI conversation state.
     */
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantThread />
      {/* Tool UIs must be inside the provider to access runtime context */}
      <ProductToolUI />
    </AssistantRuntimeProvider>
  );
}
