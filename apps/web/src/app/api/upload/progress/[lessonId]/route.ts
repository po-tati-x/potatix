import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { env } from '@/env.server';

const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! });

export async function GET(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
    }
    const raw = await redis.get<string | number>(`upload:progress:${lessonId}`);
    const progress = raw == undefined ? 0 : Number(raw);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('[upload:progress] GET error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 