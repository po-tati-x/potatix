import { NextRequest } from 'next/server';
import { createVertex } from '@ai-sdk/google-vertex';
import { streamText, type Message } from 'ai';
import * as path from 'path';

// Types for API parameters
interface StreamRequestBody {
  prompt: string;
  system?: string;
}

// Error response helper
const createErrorResponse = (message: string, status: number): Response => {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
};

// Custom authentication middleware
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-api-key');
  return authHeader === process.env.GOOGLE_CUSTOM_SECRET;
}

/**
 * Streams text generation from Gemini API using AI SDK
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!authenticateRequest(request)) {
      return createErrorResponse('Unauthorized - Invalid API key', 401);
    }
    
    // Parse and validate request
    const body = await request.json() as StreamRequestBody;
    const { prompt, system } = body;

    if (!prompt) {
      return createErrorResponse('Prompt is required', 400);
    }

    try {
      // Initialize Vertex AI SDK
      const keyFilePath = path.join(process.cwd(), 'inbound-augury-461912-h2-0e3d239a2503.json');
      
      // Create Vertex provider with credentials
      const vertex = createVertex({
        project: process.env.GOOGLE_PROJECT_ID,
        location: process.env.GOOGLE_ZONE,
        googleAuthOptions: {
          keyFilename: keyFilePath
        }
      });

      // Create the model with the specific Gemini version
      const model = vertex('gemini-2.5-pro-preview-05-06');
      
      // Create messages array for AI SDK
      const messages: Message[] = [];
      
      // Add system message if provided
      if (system) {
        messages.push({ role: 'system', content: system } as Message);
      }
      
      // Add user prompt
      messages.push({ role: 'user', content: prompt } as Message);
      
      // Generate streaming response with AI SDK
      const stream = await streamText({
        model,
        messages,
        temperature: 0.7,
        maxTokens: 2048,
      });
      
      // Return the response as a stream
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const chunk of stream.textStream) {
                // Format chunk as SSE
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              console.error('Stream error:', error);
              controller.error(error);
            }
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        }
      );
    } catch (error: unknown) {
      console.error('Error in API processing:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error processing API request';
      return createErrorResponse(errorMessage, 500);
    }
  } catch (error: unknown) {
    console.error('Error in request handling:', error);
    return createErrorResponse('Failed to process request', 500);
  }
} 