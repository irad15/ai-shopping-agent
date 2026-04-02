import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    return new Response('Error connecting to backend', { status: response.status });
  }

  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();
  let buffer = '';

  function processLine(line: string, controller: TransformStreamDefaultController) {
    if (!line.trim()) return;

    try {
      const event = JSON.parse(line);

      if (event.type === 'text') {
        // 0: = text chunk
        controller.enqueue(encoder.encode(`0:${JSON.stringify(event.content)}\n`));
      } else if (event.type === 'tool_call') {
        // 9: = tool call
        controller.enqueue(encoder.encode(`9:${JSON.stringify({
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          args: event.args,
        })}\n`));
      } else if (event.type === 'tool_result') {
        // a: = tool result
        controller.enqueue(encoder.encode(`a:${JSON.stringify({
          toolCallId: event.toolCallId,
          result: event.result,
        })}\n`));
      }
    } catch {
      // Fallback: treat unparseable data as raw text
      if (line.trim()) {
        controller.enqueue(encoder.encode(`0:${JSON.stringify(line)}\n`));
      }
    }
  }

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        processLine(line, controller);
      }
    },
    flush(controller) {
      // Process any remaining buffered data
      const remaining = buffer + decoder.decode();
      if (remaining.trim()) {
        processLine(remaining, controller);
      }
      // The Vercel Data Stream Protocol requires a finish marker.
      // assistant-ui's useDataStreamRuntime throws if this is absent.
      controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
    }
  });

  return new Response(response.body.pipeThrough(transformStream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}