import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Next.js API Route for handling chat requests.
 * 
 * Works as a "Bridge" between the React frontend and the FastAPI backend.
 * Its main responsibility is to transform the backend's raw JSON stream 
 * into the Vercel Data Stream Protocol (prefixes like 0:, 9:, a:).
 */
export async function POST(req: NextRequest) {
  // 1. INCOMING: Receive the JSON request body from the Browser (Frontend)
  const body = await req.json();

  // Optimization: Reduce the payload down to just the newest message 
  // since the Postgres database natively retrieves all historical context.
  if (body.messages && body.messages.length > 0) {
    body.messages = [body.messages[body.messages.length - 1]];
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // 2. OUT TO BACKEND: Send the heavily compressed payload to the Python server.
  const response = await fetch(`${backendUrl}/chat`, {
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

  /**
   * Translates a single line of JSON from the backend into a prefixed string.
   * 0: Text content
   * 9: Tool call status
   * a: Tool result data
   */
  function processLine(line: string, controller: TransformStreamDefaultController) {
    if (!line.trim()) return;

    try {
      const event = JSON.parse(line);
      const prefixMap: Record<string, string> = { text: '0:', tool_call: '9:', tool_result: 'a:' };
      const prefix = prefixMap[event.type];

      if (prefix) {
        // Text events send just the content; other events send the full JSON
        const payload = event.type === 'text' ? event.content : event;
        controller.enqueue(encoder.encode(`${prefix}${JSON.stringify(payload)}\n`));
      }
    } catch {
      // Fallback for non-JSON lines (usually treated as text)
      if (line.trim()) controller.enqueue(encoder.encode(`0:${JSON.stringify(line)}\n`));
    }
  }

  /**
   * Re-assembles chunks into lines and pipes them through the translator.
   */
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');

      // Keep any incomplete line in the buffer for the next chunk
      buffer = lines.pop() || '';

      for (const line of lines) {
        processLine(line, controller);
      }
    },
    flush(controller) {
      // Process remaining data and append the mandatory finish marker (d:)
      const remaining = buffer + decoder.decode();
      if (remaining.trim()) {
        processLine(remaining, controller);
      }

      // 'd:' prefix tells the frontend runtime that the stream has ended successfully
      controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
    }
  });

  /**
   * 3. BACK FROM BACKEND: This final part receives the streaming response 
   * from the Python server, translates it using the bridge logic above, 
   * and sends it directly back to the user's browser.
   */
  return new Response(response.body.pipeThrough(transformStream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}