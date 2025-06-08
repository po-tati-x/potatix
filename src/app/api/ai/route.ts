import { NextRequest, NextResponse } from 'next/server';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText, type Message } from 'ai';
import * as path from 'path';

// Types for API parameters
interface ChatRequestBody {
  prompt: string;
  system?: string;
}

// Custom authentication middleware
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-api-key');
  return authHeader === process.env.GOOGLE_CUSTOM_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }
    
    // Parse and validate request
    const body = await request.json() as ChatRequestBody;
    const { prompt, system } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

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
    
    // Format messages for AI SDK
    const messages: Message[] = [];
    
    // Add system message if provided
    if (system) {
      messages.push({ role: 'system', content: system } as Message);
    }
    
    // Add user prompt
    messages.push({ role: 'user', content: prompt } as Message);
    
    // Generate text with AI SDK
    const result = await generateText({
      model,
      messages,
      temperature: 0.7,
      maxTokens: 2048,
    });
    
    // Return the text response
    return NextResponse.json({
      response: result.text,
      raw: { candidates: [{ content: { parts: [{ text: result.text }] } }] }
    });
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to process request';
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
} 