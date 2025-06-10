import { NextRequest, NextResponse } from 'next/server';

// Define types for Gemini API
interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

interface GeminiContent {
  role: 'user' | 'model' | 'system';
  parts: GeminiPart[];
}

// Custom authentication middleware
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-api-key');
  return authHeader === process.env.GOOGLE_CUSTOM_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    // Check custom authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }
    
    // Get data from request body
    const body = await request.json();
    const { prompt, imageUrl, imageData } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    if (!imageUrl && !imageData) {
      return NextResponse.json({ error: 'Either imageUrl or imageData is required' }, { status: 400 });
    }

    // Prepare contents array for Gemini
    const contents: GeminiContent[] = [
      {
        role: 'user',
        parts: []
      }
    ];
    
    // Add text prompt
    contents[0].parts.push({ text: prompt });
    
    // Add image data
    if (imageUrl) {
      contents[0].parts.push({
        inline_data: {
          mime_type: 'image/jpeg', // Assuming JPEG, adjust if needed
          data: imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : await fetchAndConvertToBase64(imageUrl)
        }
      });
    } else if (imageData) {
      // Assuming imageData is already base64 encoded
      contents[0].parts.push({
        inline_data: {
          mime_type: imageData.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          data: imageData.split(',')[1]
        }
      });
    }

    // Gemini API endpoint - using vision-capable model
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/locations/${process.env.GOOGLE_ZONE}/publishers/google/models/gemini-2.5-pro-preview-05-06:generateContent`;
    
    // Call Gemini API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from Gemini' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from model',
      raw: data
    });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

// Helper function to fetch an image and convert to base64
async function fetchAndConvertToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image');
  }
} 