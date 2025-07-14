import { NextRequest } from 'next/server';
import { streamText, type Message } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

/**
 * API route for Gemini chat streaming
 * Uses AI SDK to generate text completions from Google's Gemini models
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types & validation
// ─────────────────────────────────────────────────────────────────────────────

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      id: z.string().optional(),
    }),
  ),
  system: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body (typed by Zod)
    const { messages, system } = bodySchema.parse(await req.json());
    
    // Validate input
    if (messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }
    
    // Initialize model with specified version
    const model = google('gemini-2.5-pro-preview-06-05');
    
    // Build enhanced system message that includes transcript context if available
    const systemMessage: string = system || 'You are a helpful assistant.';
    
    // Prepare messages with system context
    const systemPrompt = {
      id: 'system-1',
      role: 'system' as const,
      content: systemMessage,
    } satisfies Message;
    
    // Create messages array with system message first
    const messagesWithSystem = [systemPrompt, ...messages] as Message[];
    
    // Generate streaming response with appropriate context length
    const result = streamText({
      model,
      messages: messagesWithSystem,
      temperature: 0.5, // Slightly lower temperature for more factual responses
      maxTokens: 2048 * 4,  // Ensure we have room for detailed answers
    });
    
    // Return properly formatted stream response
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to process request' 
    }, { status: 500 });
  }
}