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

  // Create a manual encoder to translate raw text into the Vercel Protocol
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      if (text) {
        // Vercel AI SDK expects text chunks to be prefixed with `0:` and stringified
        controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
      }
    },
    flush(controller) {
      const text = decoder.decode();
      if (text) {
        controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
      }
    }
  });

  return new Response(response.body.pipeThrough(transformStream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}