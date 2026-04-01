import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Backend failed" }, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
