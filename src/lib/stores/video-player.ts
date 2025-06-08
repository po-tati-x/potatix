import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { videoEventBus, VideoEventType } from '../events/video-event-bus';

/**
 * Core video player state interface
 */
export interface VideoPlayerState {
  // Video metadata
  duration: number;
  currentTime: number;
  progress: number;
  
  // Player state
  isPlaying: boolean;
  isLoading: boolean;
  isMuted: boolean;
  volume: number;
  
  // Error state
  error: string | null;
  
  // Video info
  videoId: string | null;
  lessonId: string | null;
  
  // Transcript data
  transcript: {
    text: string;
    isLoading: boolean;
    error: string | null;
  };
  
  // Chapters data
  chapters: Array<{
    id: string;
    title: string;
    timestamp: number;
    description: string;
  }>;
  activeChapterId: string | null;
}

/**
 * Video player store interface with actions
 */
interface VideoPlayerStore extends VideoPlayerState {
  // Playback actions
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  seekTo: (time: number) => void;
  
  // State setters
  setVideoElement: (element: HTMLVideoElement | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setProgress: (progress: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setError: (error: string | null) => void;
  
  // Video info setters
  setVideoId: (videoId: string | null) => void;
  setLessonId: (lessonId: string | null) => void;
  
  // Transcript actions
  setTranscript: (text: string) => void;
  setTranscriptLoading: (isLoading: boolean) => void;
  setTranscriptError: (error: string | null) => void;
  
  // Chapter actions
  setChapters: (chapters: VideoPlayerState['chapters']) => void;
  setActiveChapterId: (chapterId: string | null) => void;
  
  // Reset actions
  resetVideoState: () => void;
}

/**
 * Initial state for the video player
 */
const initialVideoState: VideoPlayerState = {
  duration: 0,
  currentTime: 0,
  progress: 0,
  isPlaying: false,
  isLoading: false,
  isMuted: false,
  volume: 1,
  error: null,
  videoId: null,
  lessonId: null,
  transcript: {
    text: '',
    isLoading: false,
    error: null,
  },
  chapters: [],
  activeChapterId: null,
};

// Internal video element reference
let videoElement: HTMLVideoElement | null = null;

/**
 * Video player store with Zustand
 * Central store for all video player state and actions
 */
export const useVideoStore = create<VideoPlayerStore>()(
  devtools(
    (set, get) => ({
      ...initialVideoState,
      
      // Track video element
      setVideoElement: (element) => {
        videoElement = element;
      },
      
      // Playback actions
      play: () => {
        if (videoElement) {
          videoElement.play()
            .then(() => set({ isPlaying: true }))
            .catch((error) => set({ error: error.message }));
        }
      },
      
      pause: () => {
        if (videoElement) {
          videoElement.pause();
          set({ isPlaying: false });
        }
      },
      
      togglePlayback: () => {
        const { isPlaying } = get();
        if (isPlaying) {
          get().pause();
        } else {
          get().play();
        }
      },
      
      seekTo: (time) => {
        if (videoElement) {
          videoElement.currentTime = Math.max(0, Math.min(time, videoElement.duration));
          set({ currentTime: videoElement.currentTime });
          
          // Update active chapter based on new time
          const { chapters } = get();
          if (chapters.length > 0) {
            // Find the current chapter based on timestamp
            for (let i = chapters.length - 1; i >= 0; i--) {
              if (time >= chapters[i].timestamp) {
                set({ activeChapterId: chapters[i].id });
                break;
              }
            }
          }
        }
        
        // Also dispatch the event through the event bus for compatibility
        const { lessonId } = get();
        if (lessonId) {
          videoEventBus.dispatch(VideoEventType.SEEK_TO, {
            time,
            lessonId
          });
        }
      },
      
      // State setters
      setCurrentTime: (time) => {
        // Set current time in the store
        set({ currentTime: time });
        
        // Calculate progress as percentage
        const { duration } = get();
        if (duration > 0) {
          const progress = Math.floor((time / duration) * 100);
          set({ progress });
        }
        
        // Update active chapter based on current time
        const { chapters, activeChapterId } = get();
        if (chapters.length > 0) {
          // Find the current chapter based on timestamp
          for (let i = chapters.length - 1; i >= 0; i--) {
            if (time >= chapters[i].timestamp) {
              // Only update if different to avoid unnecessary rerenders
              if (activeChapterId !== chapters[i].id) {
                set({ activeChapterId: chapters[i].id });
              }
              break;
            }
          }
        }
      },
      
      setDuration: (duration) => set({ duration }),
      
      setProgress: (progress) => set({ progress }),
      
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
      setVolume: (volume) => {
        if (videoElement) {
          videoElement.volume = Math.max(0, Math.min(volume, 1));
        }
        set({ volume });
      },
      
      setMuted: (muted) => {
        if (videoElement) {
          videoElement.muted = muted;
        }
        set({ isMuted: muted });
      },
      
      toggleMute: () => {
        const { isMuted } = get();
        if (videoElement) {
          videoElement.muted = !isMuted;
        }
        set({ isMuted: !isMuted });
      },
      
      setError: (error) => set({ error }),
      
      // Video info setters
      setVideoId: (videoId) => set({ videoId }),
      
      setLessonId: (lessonId) => set({ lessonId }),
      
      // Transcript actions
      setTranscript: (text) => set((state) => ({ 
        transcript: { 
          ...state.transcript, 
          text 
        } 
      })),
      
      setTranscriptLoading: (isLoading) => set((state) => ({ 
        transcript: { 
          ...state.transcript, 
          isLoading 
        } 
      })),
      
      setTranscriptError: (error) => set((state) => ({ 
        transcript: { 
          ...state.transcript, 
          error 
        } 
      })),
      
      // Chapter actions
      setChapters: (chapters) => set({ chapters }),
      
      setActiveChapterId: (chapterId) => set({ activeChapterId: chapterId }),
      
      // Reset actions
      resetVideoState: () => {
        // Reset video element
        if (videoElement) {
          videoElement.pause();
          videoElement.currentTime = 0;
        }
        
        // Reset state to initial values
        set({
          ...initialVideoState,
          // Preserve video and lesson IDs for context
          videoId: get().videoId,
          lessonId: get().lessonId
        });
      },
    }),
    { name: 'video-player-store' }
  )
);

/**
 * Initialize bidirectional event listeners between video store and event bus
 * @returns Cleanup function to remove event listeners
 */
export function initializeVideoStoreEvents(): () => void {
  const store = useVideoStore.getState();
  
  // Array to store unsubscribe functions
  const unsubscribeFunctions: Array<() => void> = [];
  
  // Event bus -> Store
  unsubscribeFunctions.push(
    videoEventBus.subscribe(VideoEventType.SEEK_TO, (data) => {
      store.seekTo(data.time);
    })
  );
  
  unsubscribeFunctions.push(
    videoEventBus.subscribe(VideoEventType.PLAY, () => {
      store.play();
    })
  );
  
  unsubscribeFunctions.push(
    videoEventBus.subscribe(VideoEventType.PAUSE, () => {
      store.pause();
    })
  );
  
  // Return cleanup function that calls all unsubscribe functions
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  };
}

/**
 * Hook to check if the video is playing
 * @returns True if the video is currently playing
 */
export function useIsPlaying(): boolean {
  return useVideoStore((state) => state.isPlaying);
}

/**
 * Hook to get the current video progress
 * @returns The current progress as a percentage (0-100)
 */
export function useVideoProgress(): number {
  return useVideoStore((state) => state.progress);
}

/**
 * Hook to get current video time and duration
 * @returns Object with currentTime and duration in seconds
 */
export function useVideoTime(): { currentTime: number; duration: number } {
  return useVideoStore((state) => ({
    currentTime: state.currentTime,
    duration: state.duration
  }));
} 