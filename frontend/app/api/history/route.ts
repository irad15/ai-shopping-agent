import { NextRequest } from 'next/server';

/**
 * Next.js API Route for fetching conversation history.
 * 
 * Acts as a proxy between the React frontend and the FastAPI backend,
 * forwarding the thread_id to retrieve the full conversation history
 * from PostgreSQL. This enables session restoration on page refresh.
 */
export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get('thread_id');

  if (!threadId) {
    return new Response(JSON.stringify({ messages: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${backendUrl}/history/${threadId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ messages: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // If backend is unreachable, return empty history gracefully
    return new Response(JSON.stringify({ messages: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
