import { NextRequest, NextResponse } from 'next/server';

// Custom authentication middleware
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-api-key');
  return authHeader === process.env.GOOGLE_CUSTOM_SECRET;
}

export async function GET(request: NextRequest) {
  try {
    // Check custom authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }
    
    // Get the current token
    const currentToken = process.env.GOOGLE_AUTH_TOKEN || '';
    
    // Get just the first 15 characters to show in the response
    const tokenPreview = currentToken.substring(0, 15) + '...';
    
    return NextResponse.json({
      success: true,
      message: 'Current token preview',
      tokenPreview,
      tokenLength: currentToken.length,
      // Add a timestamp to see when this was generated
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in token debug route:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 