"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, FilmIcon, PlayCircle, Trash2, Loader2, X } from "lucide-react";
import Player from "next-video/player";
import type { UILesson } from "../lessons/draggable-lesson-list";

interface VideoPreviewProps {
  lesson: UILesson;
  onFileRemove: (lessonId: string) => void;
}

export function VideoPreview({ lesson, onFileRemove }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);

  // Debug logging on render to help diagnose issues
  useEffect(() => {
    console.log(`[VideoPreview] Rendering for lesson ${lesson.id}:`, {
      fileUrl: lesson.fileUrl,
      playbackId: lesson.playbackId,
      uploading: lesson.uploading,
      file: lesson.file
    });
  }, [lesson.id, lesson.fileUrl, lesson.uploading, lesson.file, lesson.playbackId]);

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
    if (playError) setPlayError(null);
  };

  const handleVideoError = (e: Error | unknown) => {
    console.error("[VideoPreview] Video playback error:", e);
    setPlayError("Failed to load video. Try again later.");
    setIsLoading(false);
  };

  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  // Already uploaded video (has fileUrl or playbackId)
  if (lesson.fileUrl || lesson.playbackId) {
    const playbackId = lesson.playbackId;
    const videoSrc = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : "";
    const posterSrc = lesson.fileUrl || (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg` : "");

    return (
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="relative aspect-video bg-black group">
          {isPlaying ? (
            // Video player
            <div className="absolute inset-0 w-full h-full">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {playError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10 p-4">
                  <p className="text-white text-sm mb-3">{playError}</p>
                  <button 
                    onClick={handleTogglePlay}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-md"
                  >
                    Back to Thumbnail
                  </button>
                </div>
              )}
              
              <div className="absolute top-2 right-2 z-20">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="p-1.5 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Player
                key={`preview-${lesson.id}`}
                src={videoSrc}
                poster={posterSrc}
                onLoadStart={handleLoadStart}
                onCanPlay={handleCanPlay}
                onError={handleVideoError}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  "--media-primary-color": "rgb(241, 245, 249)",
                  "--media-secondary-color": "rgba(241, 245, 249, 0.1)",
                  "--media-accent-color": "rgb(5, 150, 105)"
                } as React.CSSProperties}
                playsInline
              />
            </div>
          ) : (
            // Thumbnail with play button
            <>
              <div className="relative w-full h-full cursor-pointer" onClick={handleTogglePlay}>
                <Image
                  src={posterSrc}
                  alt={`Preview for ${lesson.title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  onError={(e) => {
                    console.error(`[VideoPreview] Error loading thumbnail for ${lesson.id}:`, posterSrc);
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' alignment-baseline='middle' font-family='monospace' fill='white'%3ENo Preview%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={handleTogglePlay}
              >
                <div className="bg-black bg-opacity-60 rounded-full p-4 group-hover:bg-opacity-80 transition-all transform group-hover:scale-105">
                  <PlayCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-slate-900">
                Video uploaded
              </span>
            </div>

            <button
              type="button"
              onClick={() => onFileRemove(lesson.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Video is processing after upload
  if (lesson.uploading) {
    return (
      <div className="border border-slate-200 rounded-md p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          <div>
            <p className="text-sm font-medium text-slate-900">Processing…</p>
            <p className="text-xs text-slate-500">Hang tight or cancel below</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onFileRemove(lesson.id)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
          aria-label="Cancel & delete video"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // In-progress upload with file
  if (lesson.file) {
    return (
      <div className="border border-slate-200 rounded-md p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FilmIcon className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-900 truncate max-w-xs">
                {lesson.file.name || 'Video file'}
              </p>
              <p className="text-xs text-slate-500">
                {formatFileSize(lesson.file.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileRemove(lesson.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">
              Uploading...
            </span>
            <span className="text-slate-900 font-medium">
              0%
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `0%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="border border-slate-200 rounded-md p-4 text-center">
      <p className="text-xs text-slate-500">No video selected.</p>
    </div>
  );
}

// Helper to format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown size';
  
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
} 