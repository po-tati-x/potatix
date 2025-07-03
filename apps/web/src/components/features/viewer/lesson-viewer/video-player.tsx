"use client";

import Player from "next-video/player";
import { useVideoController } from "./use-video-controller";
import { EmptyState, LoadingState, VideoErrorState } from "./player-ui";
import { useVideoStore } from "./video-context";

interface VideoPlayerProps {
  playbackId: string | null | undefined;
  lessonId: string;
  /** percentage (0-100) to start playback at */
  startAt?: number;
  /** precomputed orientation to avoid layout shift */
  initialOrientation: 'landscape' | 'portrait';
  /** optional precomputed aspect ratio string e.g. "4 / 3" to eliminate first-paint jump */
  initialAspectRatio?: string;
}

export function VideoPlayer(props: VideoPlayerProps) {
  const { setError } = useVideoStore();

  const {
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
  } = useVideoController({
    playbackId: props.playbackId,
    lessonId: props.lessonId,
    startAt: props.startAt ?? 0,
    initialOrientation: props.initialOrientation,
    initialAspectRatio: props.initialAspectRatio,
  });

  return (
    <div
      ref={playerWrapperRef}
      data-lesson-id={props.lessonId}
      className={wrapperClasses}
      style={wrapperStyle}
    >
      {state === "empty" && <EmptyState />}
      {state === "error" && (
        <VideoErrorState error={error} onRetry={() => setError(null)} />
      )}
      {state === "loading" && <LoadingState />}

      {props.playbackId && !error && (
        <Player
          key={`${props.lessonId}-${props.playbackId}`}
          src={videoSrc}
          poster={posterSrc}
          controls
          playsInline
          className="h-full w-full"
          style={playerStyles}
          onLoadStart={onLoadStart}
          onCanPlay={onCanPlay}
          onError={onVideoError}
        />
      )}
    </div>
  );
}