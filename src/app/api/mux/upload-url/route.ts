import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { auth } from '@/lib/auth/auth';

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID as string,
  tokenSecret: process.env.MUX_TOKEN_SECRET as string,
});

// Helper to authenticate user
async function authenticateUser(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session || !session.user) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get lesson ID from request body
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    // Create a direct upload URL
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      new_asset_settings: {
        playback_policy: ['public'],
        passthrough: JSON.stringify({ lessonId }),
      },
    });

    return NextResponse.json({ 
      url: upload.url,
      id: upload.id 
    });
  } catch (error) {
    console.error('Error creating Mux upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL' }, 
      { status: 500 }
    );
  }
} 