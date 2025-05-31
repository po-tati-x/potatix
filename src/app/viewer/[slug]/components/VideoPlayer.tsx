"use client";

import { useState } from "react";
import Player from "next-video/player";
import { Lock, AlertTriangle, RotateCcw } from "lucide-react";

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

  if (!videoId) {
    return (
      <div className="aspect-video bg-neutral-900 rounded-xl flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Video Available</h3>
        <p className="text-neutral-400 text-center max-w-md">
          This lesson doesn&apos;t have a video yet. Check back later or contact the
          instructor.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-neutral-900 rounded-xl flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">Video Error</h3>
        <p className="text-neutral-400 text-center mb-6 max-w-md">{error}</p>
        <button
          onClick={onResetError}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleVideoError = (e: Error | unknown) => {
    setIsLoading(false);
    onError(e);
  };

  // For Mux videos, we need to construct the proper URL
  const videoSrc = `https://stream.mux.com/${videoId}.m3u8`;
  const posterSrc = `https://image.mux.com/${videoId}/thumbnail.jpg?width=1280&height=720&fit_mode=preserve`;

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <Player
        key={`video-${lessonId}-${videoId}`}
        src={videoSrc}
        poster={posterSrc}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleVideoError}
        controls
        style={
          {
            width: "100%",
            height: "100%",
            "--media-primary-color": "#ffffff",
            "--media-secondary-color": "rgba(255, 255, 255, 0.1)",
            "--media-accent-color": "#000000",
            "--controls-backdrop-color": "rgba(0, 0, 0, 0.8)",
          } as React.CSSProperties
        }
        className="w-full h-full"
      />
    </div>
  );
}