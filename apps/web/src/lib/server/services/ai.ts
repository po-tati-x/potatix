import { streamText, generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const chatModel = google('gemini-2.5-pro-preview-06-05');
const gemini25 = google('gemini-2.5-pro-preview-06-05');

export async function getLessonAssistantAnswer(prompt: string): Promise<string> {
  const { text } = await generateText({ model: chatModel, prompt });
  return text;
}

const ChapterSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    timestamp: z.number(),
  }),
);

export async function generateChaptersFromTranscript(transcript: string) {
  const { object } = await generateObject({
    model: gemini25,
    schema: ChapterSchema,
    temperature: 0.4,
    messages: [
      {
        role: 'user',
        content: `You are a video transcript analyzer for a chess tutorial site. Identify meaningful chapters in the transcript and output ONLY structured JSON.\n\nTRANSCRIPT:\n"""\n${transcript}\n"""\nReturn chapters as per schema. First chapter timestamp must be 0. No extra text.`,
      },
    ],
  });

  return object;
}

export function streamLessonAnswer(prompt: string) {
  const { textStream } = streamText({ model: chatModel, prompt });
  return textStream;
}

// Generate suggested questions/prompts for a lesson
export async function generateLessonPrompts(lessonTitle: string, courseTitle: string, count = 5): Promise<string[]> {
  const schema = z.array(z.string().min(5)).length(count);

  const systemContent =
    `You are an AI assistant for an e-learning platform. Generate ${count} thoughtful, concise questions a student might ask about the lesson "${lessonTitle}" from the course "${courseTitle}". ` +
    `Return ONLY a JSON array of strings – no markdown, no extra keys.`;

  const { object } = await generateObject({
    model: gemini25,
    schema,
    temperature: 0.3,
    messages: [
      { role: 'user', content: systemContent },
    ],
  });

  return object;
} 