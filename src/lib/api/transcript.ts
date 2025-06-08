import { useQuery } from '@tanstack/react-query';

export interface Chapter {
  id: string;
  title: string;
  description: string;
  timestamp: number;
}

export interface VideoChaptersResponse {
  chapters: Chapter[];
  textLength: number;
  duration: number;
  processedAt?: string;
  error?: string;
}

/**
 * Fetch AI-generated chapters for a video by its Mux playback ID
 */
export async function fetchVideoChapters(playbackId: string, lessonId?: string): Promise<VideoChaptersResponse> {
  try {
    if (!playbackId) {
      return { 
        chapters: [],
        textLength: 0,
        duration: 0,
        error: 'No playback ID provided'
      };
    }

    // Build the API URL with both playbackId and lessonId if available
    let apiUrl = `/api/ai/transcript?playbackId=${encodeURIComponent(playbackId)}`;
    if (lessonId) {
      apiUrl += `&lessonId=${encodeURIComponent(lessonId)}`;
    }

    // Call our AI transcript processing endpoint
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Failed to fetch chapters: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      chapters: data.chapters || [],
      textLength: data.textLength || 0,
      duration: data.duration || 0,
      processedAt: data.processedAt
    };
  } catch (error) {
    console.error('Error fetching video chapters:', error);
    return {
      chapters: [],
      textLength: 0,
      duration: 0,
      error: error instanceof Error ? error.message : 'Unknown error fetching chapters'
    };
  }
}

/**
 * React hook to fetch and use AI-generated video chapters
 */
export function useVideoChapters(videoId?: string, lessonId?: string) {
  return useQuery<VideoChaptersResponse, Error>({
    queryKey: ['videoChapters', videoId, lessonId],
    queryFn: async () => {
      if (!videoId) {
        return { 
          chapters: [],
          textLength: 0,
          duration: 0,
          error: 'No video ID provided'
        };
      }
      return fetchVideoChapters(videoId, lessonId);
    },
    enabled: !!videoId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - chapters don't change once generated
  });
} 