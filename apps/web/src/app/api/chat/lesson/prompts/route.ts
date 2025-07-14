import { z } from 'zod';
import { courseService } from '@/lib/server/services/courses';
import { generateLessonPrompts } from '@/lib/server/services/ai';
import { limitChat } from '@/lib/server/utils/rate-limiter';
import { lessonService } from '@/lib/server/services/lessons';

const bodySchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
  lessonTitle: z.string(),
  count: z.number().int().min(1).max(10).optional().default(5),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success, remaining } = await limitChat(`prompt:${ip}`);
    if (!success) {
      return new Response('Too many requests – slow down.', {
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() },
      });
    }

    const parsed = bodySchema.parse(await req.json());
    const { courseId, lessonId, lessonTitle, count } = parsed;

    // Minimal validation – ensure course exists
    const course = await courseService.getCourseById(courseId);
    if (!course) return new Response('Course not found', { status: 404 });

    // Check cached prompts for lesson
    let cachedPrompts: string[] | undefined;
    if (lessonId) {
      const promptsFromDb = await lessonService.getLessonPrompts(lessonId);
      if (promptsFromDb && promptsFromDb.length > 0) cachedPrompts = promptsFromDb;
    }

    if (cachedPrompts && cachedPrompts.length > 0) {
      return new Response(JSON.stringify({ prompts: cachedPrompts }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompts = await generateLessonPrompts(lessonTitle, course.title, count);

    // Persist prompts for future requests
    if (lessonId) {
      await lessonService.saveLessonPrompts(lessonId, prompts);
    }

    return new Response(JSON.stringify({ prompts }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('[API] Lesson prompts error:', error);
    return new Response('Internal error', { status: 500 });
  }
} 