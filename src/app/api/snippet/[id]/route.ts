import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params if using Next.js 15
    const { id } = await params;
    const data = await redis.get(`snippet:${id}`);

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Upstash Redis might return object directly or stringified
    const snippet = typeof data === 'string' ? JSON.parse(data) : data;
    return NextResponse.json(snippet);
  } catch (err) {
    console.error('GET /api/snippet/:id error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const snippetData = {
      html: body.codes?.html || "",
      css: body.codes?.css || "",
      js: body.codes?.js || "",
      language: body.language,
      createdAt: Date.now(),
      codes: body.codes,
      theme: body.theme || "light"
    };

    await redis.set(`snippet:${id}`, JSON.stringify(snippetData), 'EX', 172800);

    return NextResponse.json({ id });
  } catch (err) {
    console.error('PUT /api/snippet/:id error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
