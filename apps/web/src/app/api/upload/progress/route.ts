import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { env } from '@/env.server';
import { z } from 'zod';

// Validate incoming payload – avoids `any` leakage
const bodySchema = z.object({
  lessonId: z.string(),
  progress: z.number().min(0).max(100),
});

const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! });

export async function POST(request: Request) {
  try {
    const { lessonId, progress } = bodySchema.parse(await request.json());
    await redis.set(`upload:progress:${lessonId}`, progress, { ex: 60 * 60 }); // keep 1h
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[upload:progress] POST error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 