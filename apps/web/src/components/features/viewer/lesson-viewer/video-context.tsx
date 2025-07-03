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
  playbackId: string | null;
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
  setplaybackId: (id: string | null) => void;
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
  const [playbackId, setplaybackId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const muxPlayerRef = useRef<any | null>(null);
  const pendingSeek = useRef<number | null>(null);

  const setVideoElement = (el: HTMLVideoElement) => {
    videoRef.current = el;
    const host = (el.getRootNode() as ShadowRoot).host as HTMLElement | undefined;
    if (host && host.tagName === 'MUX-PLAYER') {
      muxPlayerRef.current = host as any;
    }
    if (pendingSeek.current !== null) {
      const t = pendingSeek.current;
      try {
        if (muxPlayerRef.current) muxPlayerRef.current.currentTime = t;
        el.currentTime = t;
      } finally {
        pendingSeek.current = null;
      }
    }
  };

  const seekTo = (t: number) => {
    const el = videoRef.current;
    const mux = muxPlayerRef.current;

    const doSeek = () => {
      try {
        if (mux) mux.currentTime = t;
        if (el) el.currentTime = t;
      } catch {
        /* swallow */
      }
    };

    if (el && el.readyState >= 1) {
      doSeek();
    } else if (el) {
      const handler = () => {
        doSeek();
        el.removeEventListener('loadedmetadata', handler);
      };
      el.addEventListener('loadedmetadata', handler, { once: true });
    } else {
      pendingSeek.current = t;
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
    playbackId,
    lessonId,
    chapters,
    activeChapterId,
    setVideoElement,
    setCurrentTime,
    setDuration,
    setIsLoading,
    setIsPlaying,
    setError,
    setplaybackId,
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