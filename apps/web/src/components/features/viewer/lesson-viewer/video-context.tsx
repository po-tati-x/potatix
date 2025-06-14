import React, { createContext, useContext, useRef, useState } from "react";

interface Chapter {
  id: string;
  title: string;
  timestamp: number;
  description?: string;
}

interface VideoContextValue {
  // Player state
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  currentTime: number;
  duration: number;

  // Meta
  videoId: string | null;
  lessonId: string | null;

  // Chapters
  chapters: Chapter[];
  activeChapterId: string | null;

  // Actions
  setVideoElement: (el: HTMLVideoElement) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setIsLoading: (v: boolean) => void;
  setIsPlaying: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setVideoId: (id: string | null) => void;
  setLessonId: (id: string) => void;
  resetVideoState: () => void;

  setChapters: (c: Chapter[]) => void;
  setActiveChapterId: (id: string | null) => void;
  seekTo: (time: number) => void;
}

const VideoContext = createContext<VideoContextValue | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const setVideoElement = (el: HTMLVideoElement) => {
    videoRef.current = el;
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    try {
      videoRef.current.currentTime = time;
    } catch {
      // ignore
    }
  };

  const resetVideoState = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const value: VideoContextValue = {
    isLoading,
    isPlaying,
    error,
    currentTime,
    duration,
    videoId,
    lessonId,
    chapters,
    activeChapterId,
    setVideoElement,
    setCurrentTime,
    setDuration,
    setIsLoading,
    setIsPlaying,
    setError,
    setVideoId,
    setLessonId,
    resetVideoState,
    setChapters,
    setActiveChapterId,
    seekTo,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
}

export function useVideoStore() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error("useVideoStore must be within VideoProvider");
  return ctx;
} 