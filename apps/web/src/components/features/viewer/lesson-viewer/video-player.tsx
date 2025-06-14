'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Player from 'next-video/player';
import { Lock, AlertTriangle, RotateCcw } from 'lucide-react';
import { useVideoStore } from './video-context';
import { VideoEventType, videoEventBus } from '@/lib/shared/utils/video-event-bus';

interface VideoPlayerProps {
  videoId: string | null | undefined;
  lessonId: string;
  startAt?: number; // percentage (0-100) to start video at
}

export function VideoPlayer({
  videoId,
  lessonId,
  startAt = 0
}: VideoPlayerProps) {
  // Local UI state
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [hasSetInitialTime, setHasSetInitialTime] = useState(false);

  // Player container ref to attach events
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Get video store state and actions
  const { 
    isLoading, 
    error, 
    setVideoElement,
    setCurrentTime,
    setDuration,
    setIsLoading, 
    setIsPlaying,
    setError,
    setVideoId,
    setLessonId,
    resetVideoState
  } = useVideoStore();

  // Set video and lesson IDs when component mounts or IDs change
  useEffect(() => {
    setVideoId(videoId || null);
    setLessonId(lessonId);

    // Clean up on unmount
    return () => {
      resetVideoState();
    };
  }, [videoId, lessonId, setVideoId, setLessonId, resetVideoState]);

  // Find and register the video element
  const findAndRegisterVideoElement = useCallback(() => {
    if (!playerRef.current) return null;
    
    const hostElements = playerRef.current.querySelectorAll('*');
    for (const host of Array.from(hostElements)) {
      const shadowRoot = host.shadowRoot;
      if (shadowRoot) {
        const shadowVideo = shadowRoot.querySelector('video');
        if (shadowVideo instanceof HTMLVideoElement) {
          videoRef.current = shadowVideo;
          setVideoElement(shadowVideo);
          return shadowVideo;
        }
      }
    }
    
    return null;
  }, [setVideoElement]);

  // Direct seek function that works on the video element
  const performSeek = useCallback((time: number): boolean => {
    const videoElement = videoRef.current || findAndRegisterVideoElement();
    if (!videoElement) return false;
    
    try {
      videoElement.currentTime = time;
      return true;
    } catch (error) {
      console.error("Error seeking video:", error);
      return false;
    }
  }, [findAndRegisterVideoElement]);

  // Listen for events emitted through the video event bus directly
  useEffect(() => {
    // Subscribe to SEEK_TO events
    const unsubscribe = videoEventBus.subscribe(VideoEventType.SEEK_TO, (data) => {
      // Only handle events for this lesson
      if (data.lessonId === lessonId) {
        performSeek(data.time);
      }
    });
    
    return unsubscribe;
  }, [lessonId, performSeek]);

  // Set up video element and event listeners
  useEffect(() => {
    if (!playerRef.current || !videoId) return;
    
    // Find and register the video element
    const videoElement = findAndRegisterVideoElement();
    if (videoElement) {
      // Set up event listeners directly
      const handleLoadedMetadata = (event: Event) => {
        const video = event.target as HTMLVideoElement;
        setDuration(video.duration);
        
        // Detect aspect ratio
        const { videoWidth, videoHeight } = video;
        if (videoWidth && videoHeight) {
          const isVertical = videoHeight > videoWidth;
          setAspectRatio(isVertical ? "9:16" : "16:9");
        }
        
        // Set initial time if specified
        if (startAt > 0 && !hasSetInitialTime) {
          video.currentTime = (startAt / 100) * video.duration;
          setHasSetInitialTime(true);
        }
      };
      
      const handleTimeUpdate = (event: Event) => {
        const video = event.target as HTMLVideoElement;
        setCurrentTime(video.currentTime);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      // Set up event listeners
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      
      // Return cleanup function
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
      };
    }
  }, [videoId, startAt, hasSetInitialTime, setDuration, setCurrentTime, setIsPlaying, findAndRegisterVideoElement]);
  
  // Event handlers for player
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);
  
  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);
  
  const handleVideoError = useCallback((e: Error | unknown) => {
    setIsLoading(false);
    setError(e instanceof Error ? e.message : "Unknown error");
  }, [setIsLoading, setError]);

  const handleResetError = useCallback(() => {
    setError(null);
  }, [setError]);
  
  // Video URLs - correct Mux format
  const videoSrc = videoId ? `https://stream.mux.com/${videoId}.m3u8` : "";
  const posterSrc = videoId ? `https://image.mux.com/${videoId}/thumbnail.jpg` : "";
  
  // Container style based on aspect ratio
  const containerStyle = {
    paddingBottom: aspectRatio === "9:16" ? "177.78%" : "56.25%",
    maxWidth: aspectRatio === "9:16" ? "min(56.25vh, 330px)" : "100%",
    margin: "0 auto"
  };
  
  // Player style
  const playerStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    "--media-primary-color": "rgb(241, 245, 249)",
    "--media-secondary-color": "rgba(241, 245, 249, 0.1)",
    "--media-accent-color": "rgb(5, 150, 105)",
    "--controls-backdrop-color": "rgba(0, 0, 0, 0.7)",
  } as React.CSSProperties;
  
  // Determine the current state of the video player
  const videoState = !videoId ? "empty" : error ? "error" : isLoading ? "loading" : "ready";
  
  // Placeholder content for empty state
  const EmptyState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <Lock className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">No Video Available</h3>
      <p className="text-slate-400 text-center max-w-md">
        This lesson doesn&apos;t have a video yet. Check back later or contact the
        instructor.
      </p>
    </div>
  );
  
  // Error state content
  const ErrorState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">Video Error</h3>
      <p className="text-slate-400 text-center mb-6 max-w-md">{error}</p>
      <button
        onClick={handleResetError}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
  
  // Loading indicator content
  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div 
      className="relative rounded-md overflow-hidden bg-black w-full mx-auto" 
      style={containerStyle}
    >
      
      {/* Loading indicator (shown over video) */}
      {isLoading && <LoadingIndicator />}
      
      {/* Empty state */}
      {videoState === "empty" && <EmptyState />}
      
      {/* Error state */}
      {videoState === "error" && <ErrorState />}
      
      {/* Video player (only rendered when there's a video ID) */}
      {videoId && !error && (
        <div ref={playerRef} data-lesson-id={lessonId}>
          <Player
            key={`video-${lessonId}-${videoId}`}
            src={videoSrc}
            poster={posterSrc}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onError={handleVideoError}
            controls
            style={playerStyle}
            className="w-full h-full"
            playsInline
          />
        </div>
      )}
    </div>
  );
} 