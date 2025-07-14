import React, { createContext, useContext, useRef, useState } from "react";

// Minimal subset of Mux Player API we use
interface MuxPlayerElement extends HTMLElement {
  currentTime: number;
}

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
  error: string | undefined;
  currentTime: number;
  duration: number;

  // Meta
  playbackId: string | undefined;
  lessonId: string | undefined;

  // Chapters
  chapters: Chapter[];
  activeChapterId: string | undefined;

  // Actions
  setVideoElement: (el: HTMLVideoElement) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setIsLoading: (v: boolean) => void;
  setIsPlaying: (v: boolean) => void;
  setError: (msg: string | undefined) => void;
  setplaybackId: (id: string | undefined) => void;
  setLessonId: (id: string | undefined) => void;
  resetVideoState: () => void;

  setChapters: (c: Chapter[]) => void;
  setActiveChapterId: (id: string | undefined) => void;
  seekTo: (time: number) => void;
}

const VideoContext = createContext<VideoContextValue | undefined>(undefined);

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackId, setplaybackId] = useState<string | undefined>();
  const [lessonId, setLessonId] = useState<string | undefined>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const muxPlayerRef = useRef<MuxPlayerElement | null>(null);
  const pendingSeek = useRef<number | undefined>(undefined);

  const setVideoElement = (el: HTMLVideoElement) => {
    videoRef.current = el;
    const host = (el.getRootNode() as ShadowRoot).host as HTMLElement | undefined;
    if (host && host.tagName === 'MUX-PLAYER') {
      muxPlayerRef.current = host as MuxPlayerElement;
    }
    if (pendingSeek.current !== undefined) {
      const t = pendingSeek.current;
      try {
        if (muxPlayerRef.current) muxPlayerRef.current.currentTime = t;
        el.currentTime = t;
      } finally {
        pendingSeek.current = undefined;
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
    setError(undefined);
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