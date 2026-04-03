'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useDataStreamRuntime } from '@assistant-ui/react-data-stream';
import { AssistantThread } from '@/components/AssistantThread';
import { ProductToolUI } from '@/components/ProductToolUI';

export function MyAssistant() {
  /**
   * Initialize the AI Runtime using the Vercel Data Stream Protocol.
   * This hook manages the communication with the Next.js API bridge.
   */
  const runtime = useDataStreamRuntime({
    api: '/api/chat',
    protocol: 'data-stream',
  });

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
