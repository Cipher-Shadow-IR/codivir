import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4().substring(0, 8);
    
    const snippetData = {
      html: body.codes?.html || "",
      css: body.codes?.css || "",
      js: body.codes?.js || "",
      language: body.language,
      createdAt: Date.now(),
      codes: body.codes,
      theme: body.theme || "light"
    };

    await redis.set(`snippet:${id}`, JSON.stringify(snippetData), { ex: 172800 });

    return NextResponse.json({ id });
  } catch (err) {
    console.error('POST /api/snippet error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
