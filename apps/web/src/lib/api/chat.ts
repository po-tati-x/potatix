import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useChatStore } from '@/lib/stores/chat';
import { useChat } from 'ai/react';
import { useState, useCallback, useEffect } from 'react';
import { useLesson } from './courses/lesson-hooks';

// Consistent message format
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SendChatMessageParams {
  lessonId: string;
  content: string;
  lessonTitle?: string;
}

// Interface for transcript response
export interface VideoTranscriptResponse {
  text: string;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Creates an AI chat instance configured for lesson context
 */
export function useAIChat(lessonId: string, courseId: string, lessonTitle?: string) {
  // Get lesson data including transcript if available - only if courseId is provided
  const { data: lessonData } = useLesson(courseId, lessonId);
  const [transcriptContent, setTranscriptContent] = useState<string | undefined>(undefined);
  
  // Skip lesson data fetching if courseId is not valid
  const shouldFetchLessonData = !!courseId && courseId !== lessonId;
  
  // Get transcript content when lesson data loads
  useEffect(() => {
    if (!shouldFetchLessonData) return;
    
    // If we have transcript data from the DB, format it for the AI
    if (lessonData?.transcriptData?.chapters) {
      const formattedTranscript = lessonData.transcriptData.chapters
        .map(chapter => {
          // Format time as MM:SS
          const mins = Math.floor(chapter.timestamp / 60);
          const secs = Math.floor(chapter.timestamp % 60);
          const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
          
          return `[${timeStr}] ${chapter.title}\n${chapter.description}`;
        })
        .join('\n\n');
      
      setTranscriptContent(formattedTranscript);
    }
  }, [lessonData, shouldFetchLessonData]);

  // Create system prompt based on available data
  const systemPrompt = buildSystemPrompt(lessonTitle, transcriptContent);
  
  // Create chat instance with context
  return useChat({
    id: lessonId,
    api: '/api/ai/chat/stream',
    body: {
      system: systemPrompt,
      lessonId: lessonId,
      lessonTranscript: transcriptContent
    },
    onError: (error) => {
      console.error('Chat API error:', error);
    },
  });
}

/**
 * Build a comprehensive system prompt with available context
 */
function buildSystemPrompt(lessonTitle?: string, transcript?: string): string {
  let prompt = 'You are a helpful AI assistant answering questions about this lesson using markdown.';
  
  if (lessonTitle) {
    prompt += ` The lesson title is: "${lessonTitle}".`;
  }
  
  if (transcript) {
    prompt += `\n\nHere is a transcript of the lesson content with timestamps:\n\n${transcript}\n\n`;
    prompt += `Use this context to provide specific, accurate responses about the lesson content. 
    
IMPORTANT: When referring to specific parts of the lesson, include the relevant timestamps in this format: [MM:SS]. 
For example: "As explained at [04:35], the opening strategy involves..."
These timestamps will make it easier for the user to locate the exact part of the lesson you're referring to.`;
  } else {
    prompt += ' Provide helpful, concise responses based on your knowledge. Use markdown.';
  }
  
  return prompt;
}

/**
 * Fetch transcript for a video by its Mux playback ID
 * Uses the auto-generated captions from Mux via our API
 */
export async function fetchVideoTranscript(playbackId: string): Promise<VideoTranscriptResponse> {
  try {
    if (!playbackId) {
      return { 
        text: '', 
        status: 'error', 
        error: 'No playback ID provided' 
      };
    }

    // Use our server API endpoint instead of direct Mux calls
    const response = await fetch(`/api/mux/transcript?playbackId=${encodeURIComponent(playbackId)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Failed to fetch transcript: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      text: data.transcript || '',
      status: 'success'
    };
  } catch (error) {
    console.error('Error fetching video transcript:', error);
    return {
      text: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error fetching transcript'
    };
  }
}

/**
 * React hook to fetch and use video transcript
 */
export function useVideoTranscript(videoId?: string) {
  return useQuery<VideoTranscriptResponse, Error>({
    queryKey: ['videoTranscript', videoId],
    queryFn: async () => {
      if (!videoId) {
        return { 
          text: '', 
          status: 'error' as const, 
          error: 'No video ID provided' 
        };
      }
      return fetchVideoTranscript(videoId);
    },
    enabled: !!videoId,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - transcripts don't change often
  });
}

/**
 * Custom hook that manages chat interactions with lesson context
 * Provides simplified interface for sending messages
 */
export function useChatWithLesson(lessonId: string, lessonTitle?: string, courseId?: string) {
  const queryClient = useQueryClient();
  const setLoading = useChatStore((state) => state.setLoading);
  const [error, setError] = useState<string | null>(null);
  
  // Only use courseId if it's different from lessonId to avoid incorrect API calls
  const shouldUseLessonAsContext = courseId && courseId !== lessonId;
  
  // Create chat instance - only pass courseId when it's valid and different from lessonId
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = 
    useAIChat(
      lessonId,
      shouldUseLessonAsContext ? courseId : '',
      lessonTitle
    );
  
  // Send message handler
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      setLoading(lessonId, true);
      setError(null);
      
      // Use the chat SDK directly
      setInput(content);
      await handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
      
      queryClient.invalidateQueries({ queryKey: ['chat', lessonId] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Send message error:', err);
    } finally {
      setLoading(lessonId, false);
    }
  }, [lessonId, setInput, handleSubmit, setLoading, queryClient]);
  
  // Clear messages
  const clearChat = useCallback(() => {
    setInput('');
    queryClient.invalidateQueries({ queryKey: ['chat', lessonId] });
  }, [lessonId, setInput, queryClient]);
  
  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    sendMessage,
    clearChat
  };
}

export function useClearChat() {
  const queryClient = useQueryClient();
  const { clearMessages } = useChatStore();

  return useMutation({
    mutationFn: async ({ lessonId }: { lessonId: string }) => {
      clearMessages(lessonId);
      return true;
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat', lessonId] });
    },
  });
} 