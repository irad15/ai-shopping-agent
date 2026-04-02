'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useDataStreamRuntime } from '@assistant-ui/react-data-stream';
import { AssistantThread } from '@/components/AssistantThread';
import { ProductToolUI } from '@/components/ProductToolUI';

export function MyAssistant() {
  const runtime = useDataStreamRuntime({
    api: '/api/chat',
    protocol: 'data-stream',
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantThread />
      {/* Tool UIs must be inside the provider to access runtime context */}
      <ProductToolUI />
    </AssistantRuntimeProvider>
  );
}
