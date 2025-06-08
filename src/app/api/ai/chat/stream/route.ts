import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * API route for Gemini chat streaming
 * Uses AI SDK to generate text completions from Google's Gemini models
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request
    const body = await req.json();
    const { messages, system } = body;
    
    // Validate input
    if (!messages?.length) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }
    
    // Initialize model with specified version
    const model = google('gemini-2.5-pro-preview-06-05');
    
    // Build enhanced system message that includes transcript context if available
    const systemMessage: string = system || 'You are a helpful assistant.';
    
    // Prepare messages with system context
    const systemPrompt = {
      id: 'system-1', 
      role: 'system',
      content: systemMessage
    };
    
    // Create messages array with system message first
    const messagesWithSystem = [systemPrompt, ...messages];
    
    // Generate streaming response with appropriate context length
    const result = await streamText({
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