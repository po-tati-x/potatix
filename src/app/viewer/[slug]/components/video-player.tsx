"use client";

import { useState, useRef } from "react";
import Player from "next-video/player";
import { Lock, AlertTriangle, RotateCcw } from "lucide-react";

type VideoState = "loading" | "ready" | "error" | "empty";

interface VideoPlayerProps {
  videoId: string | null | undefined;
  lessonId: string;
  error: string | null;
  onError: (e: Error | unknown) => void;
  onResetError: () => void;
}

export function VideoPlayer({
  videoId,
  lessonId,
  error,
  onError,
  onResetError,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [isVertical, setIsVertical] = useState(false);
  const playerRef = useRef<HTMLVideoElement>(null);
  
  // Determine the current state of the video player
  const videoState: VideoState = 
    !videoId ? "empty" :
    error ? "error" :
    isLoading ? "loading" : "ready";

  // Handler for when video metadata is loaded (used to detect aspect ratio)
  const handleMetadataLoaded = () => {
    if (!playerRef.current) return;
    
    const { videoWidth, videoHeight } = playerRef.current;
    
    // Set dimensions and check if vertical
    setVideoDimensions({ width: videoWidth, height: videoHeight });
    const isVerticalVideo = videoHeight > videoWidth;
    setIsVertical(isVerticalVideo);
    
    if (videoWidth && videoHeight) {
      setAspectRatio(isVerticalVideo ? "9:16" : "16:9");
    }
  };

  // Event handlers
  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleVideoError = (e: Error | unknown) => {
    setIsLoading(false);
    onError(e);
  };

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
  
  // Placeholder content for empty or error states
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
  
  const ErrorState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">Video Error</h3>
      <p className="text-slate-400 text-center mb-6 max-w-md">{error}</p>
      <button
        onClick={onResetError}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
  
  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  // Debug info component
  const DebugInfo = () => (
    <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white p-2 z-50 text-xs font-mono">
      <div>Debug Info:</div>
      <div>Video Dimensions: {videoDimensions.width}x{videoDimensions.height}</div>
      <div>Video Aspect Ratio: {videoDimensions.width}/{videoDimensions.height}</div>
      <div>Is Vertical: {isVertical.toString()}</div>
      <div>Aspect Ratio State: {aspectRatio}</div>
    </div>
  );

  return (
    <div 
      className="relative rounded-md overflow-hidden bg-black w-full mx-auto" 
      style={containerStyle}
    >
      {/* Debug info overlay */}
      {videoId && !error && <DebugInfo />}
      
      {/* Loading indicator (shown over video) */}
      {isLoading && <LoadingIndicator />}
      
      {/* Empty state */}
      {videoState === "empty" && <EmptyState />}
      
      {/* Error state */}
      {videoState === "error" && <ErrorState />}
      
      {/* Video player (only rendered when there's a video ID) */}
      {videoId && !error && (
        <Player
          ref={playerRef}
          key={`video-${lessonId}-${videoId}`}
          src={videoSrc}
          poster={posterSrc}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
          onLoadedMetadata={handleMetadataLoaded}
          controls
          style={playerStyle}
          className="w-full h-full"
          playsInline
        />
      )}
    </div>
  );
}