import { NextRequest } from 'next/server';
import { fetchMuxTranscript } from '@/lib/utils/mux';

/**
 * API route to fetch Mux video transcriptions
 */
export async function GET(request: NextRequest) {
  try {
    // Get playbackId from URL
    const { searchParams } = new URL(request.url);
    const playbackId = searchParams.get('playbackId');
    
    if (!playbackId) {
      return Response.json(
        { error: 'Playback ID is required' },
        { status: 400 }
      );
    }

    // Use the utility function to fetch the transcript
    const { transcript, language, error } = await fetchMuxTranscript(playbackId);
    
    if (error) {
      return Response.json(
        { error },
        { status: 404 }
      );
    }
    
    return Response.json({
      transcript,
      language
    });
    
  } catch (error) {
    console.error('Error in transcript route:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
} 