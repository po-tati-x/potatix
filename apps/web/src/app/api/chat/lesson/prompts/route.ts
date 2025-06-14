import { z } from 'zod';
import { courseService } from '@/lib/server/services/courses';
import { generateLessonPrompts } from '@/lib/server/services/ai';

const bodySchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
  lessonTitle: z.string(),
  count: z.number().int().min(1).max(10).optional().default(5),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { courseId, lessonTitle, count } = bodySchema.parse(json);

    // Minimal validation – ensure course exists
    const course = await courseService.getCourseById(courseId);
    if (!course) return new Response('Course not found', { status: 404 });

    const prompts = await generateLessonPrompts(lessonTitle, course.title, count);
    return new Response(JSON.stringify({ prompts }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('[API] Lesson prompts error:', error);
    return new Response('Internal error', { status: 500 });
  }
} 