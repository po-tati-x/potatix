import { env } from '@/env.server';

/**
 * Utility functions for working with Mux videos
 */

/**
 * Get Mux asset ID from a playback ID
 */
// Type for Mux playback ID -> asset ID response
interface MuxPlaybackResponse {
  data?: {
    object?: {
      id?: string;
    };
  };
}

interface MuxAssetDetailsResponse {
  data?: {
    tracks?: MuxTrack[];
  }; 
}

export async function getMuxAssetId(playbackId: string): Promise<string | undefined> {
  if (!playbackId) return undefined;
  
  try {
    const muxToken = Buffer.from(
      `${env.MUX_TOKEN_ID}:${env.MUX_TOKEN_SECRET}`
    ).toString('base64');
    
    const playbackResponse = await fetch(
      `https://api.mux.com/video/v1/playback-ids/${playbackId}`,
      {
        headers: {
          'Authorization': `Basic ${muxToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!playbackResponse.ok) {
      console.error(`Failed to get asset ID: ${playbackResponse.status}`);
      return undefined;
    }
    
    const playbackData = (await playbackResponse.json()) as MuxPlaybackResponse;
    const assetId = playbackData.data?.object?.id;
    
    return assetId;
  } catch (error) {
    console.error('Error getting Mux asset ID:', error);
    return undefined;
  }
}

/**
 * Delete a Mux asset by its ID
 */
export async function deleteMuxAsset(assetId: string): Promise<boolean> {
  if (!assetId) return false;
  
  try {
    const muxToken = Buffer.from(
      `${env.MUX_TOKEN_ID}:${env.MUX_TOKEN_SECRET}`
    ).toString('base64');
    
    const response = await fetch(
      `https://api.mux.com/video/v1/assets/${assetId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${muxToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 204) {
      console.log(`Successfully deleted Mux asset: ${assetId}`);
      return true;
    }
    
    console.error(`Failed to delete Mux asset: ${response.status}`);
    return false;
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    return false;
  }
}

/**
 * Get Mux API authorization token
 */
function getMuxAuthToken(): string {
  return Buffer.from(
    `${env.MUX_TOKEN_ID}:${env.MUX_TOKEN_SECRET}`
  ).toString('base64');
}

// Type for Mux track objects
interface MuxTrack {
  id: string;
  type: string;
  text_type?: string;
  language_code?: string;
  [key: string]: unknown;
}

/**
 * Fetch the transcript for a Mux video directly
 */
export async function fetchMuxTranscript(playbackId: string): Promise<{ 
  transcript: string; 
  language: string;
  error?: string;
}> {
  if (!playbackId) {
    return { 
      transcript: '',
      language: 'en',
      error: 'No playback ID provided'
    };
  }
  
  try {
    // First get the asset ID from the playback ID
    const assetId = await getMuxAssetId(playbackId);
    
    if (!assetId) {
      return {
        transcript: '',
        language: 'en',
        error: 'Could not find asset ID for this playback ID'
      };
    }
    
    // Get asset details including tracks
    const muxToken = getMuxAuthToken();
    const assetResponse = await fetch(
      `https://api.mux.com/video/v1/assets/${assetId}`,
      {
        headers: {
          'Authorization': `Basic ${muxToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!assetResponse.ok) {
      console.error(`Failed to get asset details: ${assetResponse.status}`);
      return {
        transcript: '',
        language: 'en',
        error: 'Failed to get video details'
      };
    }
    
    const assetData = (await assetResponse.json()) as MuxAssetDetailsResponse;
    const tracks: MuxTrack[] = assetData.data?.tracks ?? [];
    
    // Find the subtitle track
    const subtitleTrack = tracks.find((track: MuxTrack) => 
      track.type === 'text' && 
      (track.text_type === 'subtitles' || track.language_code === 'en')
    );
    
    if (!subtitleTrack || !subtitleTrack.id) {
      // Try fallback method
      return await fetchMuxTranscriptDirectly(playbackId);
    }
    
    // Get the transcript using the direct track URL
    const transcriptUrl = `https://stream.mux.com/${playbackId}/text/${subtitleTrack.id}.vtt`;
    const transcriptResponse = await fetch(transcriptUrl);
    
    if (!transcriptResponse.ok) {
      // Try fallback method
      return await fetchMuxTranscriptDirectly(playbackId);
    }
    
    const transcriptText = await transcriptResponse.text();
    
    return {
      transcript: transcriptText.trim(),
      language: subtitleTrack.language_code || 'en'
    };
    
  } catch (error) {
    console.error('Error fetching transcript:', error);
    
    // If the API approach fails, try direct URL as fallback
    return await fetchMuxTranscriptDirectly(playbackId);
  }
}

/**
 * Fallback method to try getting transcript directly from stream URL
 */
async function fetchMuxTranscriptDirectly(playbackId: string): Promise<{
  transcript: string;
  language: string;
  error?: string;
}> {
  try {
    // Check if video exists first
    const videoUrl = `https://stream.mux.com/${playbackId}.m3u8`;
    let videoCheck: Response | undefined;
    try {
      videoCheck = await fetch(videoUrl, { method: 'HEAD' });
    } catch {
      videoCheck = undefined;
    }
    
    if (!videoCheck || !videoCheck.ok) {
      return {
        transcript: '',
        language: 'en',
        error: 'Invalid or inaccessible video ID'
      };
    }

    // Try to request the direct transcript URL
    // This won't work for all videos but it's a good fallback
    const textUrl = `https://stream.mux.com/${playbackId}/text.txt`;
    const textResponse = await fetch(textUrl);
    
    if (textResponse.ok) {
      const transcriptText = await textResponse.text();
      return {
        transcript: transcriptText.trim(),
        language: 'en'
      };
    }
    
    return {
      transcript: '',
      language: 'en',
      error: 'No transcript found via direct approach'
    };
  } catch (error) {
    return {
      transcript: '',
      language: 'en',
      error: error instanceof Error ? error.message : 'Failed to fetch transcript directly'
    };
  }
} 