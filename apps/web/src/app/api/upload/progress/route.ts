import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { env } from '@/env.server';

const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! });

export async function POST(request: Request) {
  try {
    const { lessonId, progress } = await request.json();
    if (!lessonId || typeof progress !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await redis.set(`upload:progress:${lessonId}`, progress, { ex: 60 * 60 }); // keep 1h
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[upload:progress] POST error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 