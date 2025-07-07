import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { env } from '@/env.server';
import { db, courseSchema } from '@potatix/db';
import { eq } from 'drizzle-orm';

// POST /api/mux/cancel-upload  { lessonId: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId } = body ?? {};
    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
    }

    // Fetch direct upload id
    const rows = await db!
      .select({ id: courseSchema.lesson.directUploadId })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.id, lessonId))
      .limit(1);

    const directUploadId = rows[0]?.id;
    if (!directUploadId) {
      return NextResponse.json({ error: 'Direct upload not found' }, { status: 404 });
    }

    // Cancel via Mux
    const mux = new Mux({ tokenId: env.MUX_TOKEN_ID, tokenSecret: env.MUX_TOKEN_SECRET });
    try {
      await mux.video.uploads.cancel(directUploadId as string);
    } catch (err) {
      console.error('[Mux cancel-upload] mux error', err);
    }

    // Mark lesson cancelled
    await db!
      .update(courseSchema.lesson)
      .set({ uploadStatus: 'CANCELLED' })
      .where(eq(courseSchema.lesson.id, lessonId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Mux cancel-upload] route err', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 