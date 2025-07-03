import { useRef, useEffect, useState, useCallback, CSSProperties } from 'react';
import clsx from 'clsx';
import { useVideoStore } from './video-context';
import { videoEventBus, VideoEventType } from '@/lib/shared/utils/video-event-bus';
import { useCourseProgressStore } from '@/lib/client/stores/course-progress-store';
import { useUpdateLessonProgress } from '@/lib/client/hooks/use-course-data';

interface ControllerProps {
  playbackId: string | null | undefined;
  lessonId: string;
  startAt: number;
  initialOrientation: 'landscape' | 'portrait';
  initialAspectRatio?: string;
}

export function useVideoController({ playbackId, lessonId, startAt, initialOrientation, initialAspectRatio }: ControllerProps) {
  /* ---------------------------------------------------------- */
  /* Store wiring                                               */
  /* ---------------------------------------------------------- */
  const {
    isLoading,
    error,
    setVideoElement,
    setCurrentTime,
    setDuration,
    setIsLoading,
    setIsPlaying,
    setError,
    setplaybackId,
    setLessonId,
    resetVideoState
  } = useVideoStore();

  const { updateProgress } = useUpdateLessonProgress();

  /* ---------------------------------------------------------- */
  /* Local refs / state                                         */
  /* ---------------------------------------------------------- */
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const hasSetInitialTime = useRef(false);
  const lastProgressSync = useRef(0);

  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(initialOrientation);
  const [aspectRatio, setAspectRatio] = useState<string>(
    initialAspectRatio || (initialOrientation === 'portrait' ? '9 / 16' : '16 / 9')
  );

  /* ---------------------------------------------------------- */
  /* Helpers                                                    */
  /* ---------------------------------------------------------- */
  const resolveVideoElement = useCallback(() => {
    if (videoElementRef.current) return videoElementRef.current;
    if (!playerWrapperRef.current) return null;

    const muxPlayer = playerWrapperRef.current.querySelector('mux-player');
    const shadowVideo = muxPlayer?.shadowRoot?.querySelector('video');
    if (shadowVideo instanceof HTMLVideoElement) {
      videoElementRef.current = shadowVideo;
      setVideoElement(shadowVideo);
      return shadowVideo;
    }
    return null;
  }, [setVideoElement]);

  const performSeek = useCallback(
    (time: number) => {
      // try mux-player public API
      const muxEl = playerWrapperRef.current?.querySelector('mux-player') as any | null;
      if (muxEl) {
        try {
          muxEl.currentTime = time;
          return true;
        } catch {/* fallthrough */}
      }
      const el = resolveVideoElement();
      if (!el) return false;
      try {
        el.currentTime = time;
        return true;
      } catch {
        return false;
      }
    },
    [resolveVideoElement]
  );

  /* ---------------------------------------------------------- */
  /* Mount bookkeeping                                          */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    setplaybackId(playbackId ?? null);
    setLessonId(lessonId);
    return () => resetVideoState();
  }, [playbackId, lessonId, setplaybackId, setLessonId, resetVideoState]);

  /* ---------------------------------------------------------- */
  /* Event bus                                                  */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    const unsub = videoEventBus.subscribe(VideoEventType.SEEK_TO, ({ lessonId: lId, time }) => {
      if (lId === lessonId) performSeek(time);
    });
    return unsub;
  }, [lessonId, performSeek]);

  /* ---------------------------------------------------------- */
  /* Player element listeners (robust – retries until ready)    */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    if (!playbackId) return;

    let cleanup: (() => void) | null = null;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;
      const el = resolveVideoElement();
      if (!el) {
        // keep trying until mux-player hydrates and shadow <video> appears
        requestAnimationFrame(attach);
        return;
      }

      const handleLoadedMetadata = () => {
        setDuration(el.duration);
        if (el.videoWidth && el.videoHeight) {
          setAspectRatio(`${el.videoWidth} / ${el.videoHeight}`);
          setOrientation(el.videoWidth >= el.videoHeight ? 'landscape' : 'portrait');
        }
        if (!hasSetInitialTime.current) {
          if (startAt > 0) {
            el.currentTime = (startAt / 100) * el.duration;
          } else {
            const { courseProgress, currentCourseId } = useCourseProgressStore.getState();
            const resume =
              currentCourseId && courseProgress.get(currentCourseId)?.lessonProgress.get(lessonId)?.lastPosition;
            if (resume && resume > 5) el.currentTime = resume;
          }
          hasSetInitialTime.current = true;
        }
      };

      const handleTimeUpdate = () => {
        if (!hasSetInitialTime.current) return;
        setCurrentTime(el.currentTime);
        const now = Date.now();
        if (now - lastProgressSync.current > 5000) {
          lastProgressSync.current = now;
          updateProgress(lessonId, Math.floor(el.currentTime), Math.floor(el.duration));
        }
      };

      const play = () => setIsPlaying(true);
      const pause = () => setIsPlaying(false);

      el.addEventListener('loadedmetadata', handleLoadedMetadata);
      el.addEventListener('timeupdate', handleTimeUpdate);
      el.addEventListener('play', play);
      el.addEventListener('pause', pause);

      if (el.readyState >= 1) handleLoadedMetadata();

      cleanup = () => {
        el.removeEventListener('loadedmetadata', handleLoadedMetadata);
        el.removeEventListener('timeupdate', handleTimeUpdate);
        el.removeEventListener('play', play);
        el.removeEventListener('pause', pause);
      };
    };

    attach();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [playbackId, lessonId, startAt, resolveVideoElement, setDuration, setCurrentTime, updateProgress, setIsPlaying]);

  /* ---------------------------------------------------------- */
  /* Derived data / styling                                     */
  /* ---------------------------------------------------------- */
  const videoSrc = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : '';
  const posterSrc = playbackId ? `https://image.mux.com/${playbackId}/thumbnail.webp` : '';

  const wrapperClasses = clsx(
    'relative w-full rounded-md bg-black',
    orientation === 'portrait' ? 'max-w-xs mx-auto' : undefined
  );
  const wrapperStyle: CSSProperties = { aspectRatio };
  const playerStyles: CSSProperties = {
    '--media-primary-color': 'rgb(241 245 249)',
    '--media-secondary-color': 'rgba(241 245 249 / 0.1)',
    '--media-accent-color': 'rgb(5 150 105)',
    aspectRatio,
  } as CSSProperties;

  const state = !playbackId ? 'empty' : error ? 'error' : isLoading ? 'loading' : 'ready';

  /* ---------------------------------------------------------- */
  /* Callback wrappers                                          */
  /* ---------------------------------------------------------- */
  const onLoadStart = () => setIsLoading(true);
  const onCanPlay = () => setIsLoading(false);
  const onVideoError = (e: unknown) => {
    setIsLoading(false);
    setError(e instanceof Error ? e.message : 'Unknown error');
  };

  return {
    playerWrapperRef,
    videoSrc,
    posterSrc,
    wrapperClasses,
    wrapperStyle,
    playerStyles,
    state,
    error,
    onLoadStart,
    onCanPlay,
    onVideoError,
  };
} 