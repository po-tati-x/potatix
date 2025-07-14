import { z } from 'zod';
import { streamLessonAnswer } from '@/lib/server/services/ai';
import { courseService } from '@/lib/server/services/courses';
import { limitChat } from '@/lib/server/utils/rate-limiter';

const bodySchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
  lessonTitle: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    // Identify caller – use forwarded IP to bucket limits
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Apply rate limit (10 requests / minute)
    const { success, remaining } = await limitChat(`chat:${ip}`);
    if (!success) {
      return new Response('Too many requests – slow down.', {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      });
    }

    const { courseId, lessonTitle, messages } = bodySchema.parse(await req.json());

    // Basic access check – ensure course / lesson exist & published
    const course = await courseService.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    // TODO: add session user and enrollment check when auth util available

    // Build prompt – simple system prompt + conversation snippet + user latest
    const conversation = messages
      .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');
    const prompt = `You are an AI tutor helping with the lesson "${lessonTitle}" from the course "${course.title}". Answer clearly and reference the lesson when helpful.\n\nWhen referring to a specific moment in the lesson video, ALWAYS embed the timestamp in square brackets using the exact five-character format [MM:SS] (two-digit minutes colon two-digit seconds). Example: [02:15]. Do NOT wrap the timestamp in backticks or any other markup.\n\nConversation so far:\n${conversation}\n\nTutor:`;

    const textStream = await streamLessonAnswer(prompt);
    return new Response(textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('[API] Chat lesson error:', error);
    return new Response('Internal error', { status: 500 });
  }
} 