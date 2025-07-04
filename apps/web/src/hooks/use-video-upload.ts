"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as UpChunk from "@mux/upchunk";
import { LESSON_UPLOAD_STATUS, UPLOAD_CONFIG, LessonUploadStatus } from "@/lib/config/upload";

interface UseVideoUploadParams {
  lessonId: string;
  onDirectUploadComplete?: (lessonId: string) => void;
  onProcessingComplete?: (lessonId: string, lesson?: any) => void;
  onFileChange?: (
    file: File | React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
  /**
   * When rehydrating after a full page reload, pass the last known upload
   * status from the database so the hook can resume polling instead of
   * starting from scratch.
   */
  initialStatus?: LessonUploadStatus;
}

export function useVideoUpload({
  lessonId,
  onDirectUploadComplete,
  onProcessingComplete,
  onFileChange,
  initialStatus = LESSON_UPLOAD_STATUS.IDLE,
}: UseVideoUploadParams) {
  // ---------------- state ----------------
  const [status, setStatus] = useState<LessonUploadStatus>(initialStatus);
  const [progress, setProgress] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ---------------- refs ------------------
  type UpChunkInstance = ReturnType<typeof UpChunk.createUpload>;
  const uploadRef = useRef<UpChunkInstance | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef(0);
  const pollCancelRef = useRef<(() => void) | null>(null);
  const statusRef = useRef<LessonUploadStatus>(initialStatus);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      uploadRef.current?.abort();
      pollCancelRef.current?.();
    };
  }, []);

  // Kick off polling immediately if we mounted in PROCESSING state
  useEffect(() => {
    if (initialStatus === LESSON_UPLOAD_STATUS.PROCESSING) {
      pollProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus]);

  // ------------- helpers ------------------
  function resetState() {
    uploadRef.current?.abort();
    pollCancelRef.current?.();

    setProgress(0);
    setEtaSeconds(null);
    setError(null);
    setStatus(LESSON_UPLOAD_STATUS.IDLE);
    setProcessingStatus(null);

    // refs
    startTimeRef.current = null;
    pauseStartRef.current = null;
    totalPausedTimeRef.current = 0;
  }

  // Format utils (kept here to avoid re-export)
  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
  }, []);

  const formatSeconds = useCallback((sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}m ${s}s`;
  }, []);

  // ------------- file selection --------------
  function validateFile(file: File) {
    if (!file.type.startsWith("video/")) {
      throw new Error("Only video files are allowed");
    }
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES) {
      throw new Error("File too large (max 2 GB)");
    }
  }

  const selectFile = (file: File) => {
    try {
      validateFile(file);
      resetState();
      setSelectedFile(file);
      onFileChange?.(file, lessonId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ------------- upload -----------------------
  const startUpload = async () => {
    if (!selectedFile || status !== LESSON_UPLOAD_STATUS.IDLE) return;

    setStatus(LESSON_UPLOAD_STATUS.PREPARING);
    setError(null);

    const fetchUploadUrl = async (): Promise<string> => {
      for (let attempt = 0; attempt < UPLOAD_CONFIG.MAX_FETCH_RETRIES; attempt++) {
        try {
          const res = await fetch("/api/mux/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId }),
          });
          if (!res.ok) throw new Error("Failed to get upload URL");
          const { url } = (await res.json()) as { url: string };
          return url;
        } catch (e) {
          if (attempt === UPLOAD_CONFIG.MAX_FETCH_RETRIES - 1) throw e;
          await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        }
      }
      throw new Error("Unreachable");
    };

    let uploadUrl: string;
    try {
      uploadUrl = await fetchUploadUrl();
    } catch (err) {
      setError((err as Error).message);
      setStatus(LESSON_UPLOAD_STATUS.ERROR);
      return;
    }

    const upload = UpChunk.createUpload({
      endpoint: uploadUrl,
      file: selectedFile,
      chunkSize: UPLOAD_CONFIG.CHUNK_SIZE_BYTES / 1024, // KB
    });

    uploadRef.current = upload;
    startTimeRef.current = Date.now();
    totalPausedTimeRef.current = 0;
    setStatus(LESSON_UPLOAD_STATUS.UPLOADING);
    statusRef.current = LESSON_UPLOAD_STATUS.UPLOADING;

    upload.on("progress", ({ detail }) => {
      if (statusRef.current !== LESSON_UPLOAD_STATUS.UPLOADING) return; // ignore events while paused
      const percent = detail as number;
      setProgress(percent);

      const start = startTimeRef.current;
      if (!start) return;
      const elapsed = (Date.now() - start - totalPausedTimeRef.current) / 1000;
      const bytesUploaded = (selectedFile.size * percent) / 100;
      const speed = bytesUploaded / Math.max(elapsed, 1);
      if (speed > 0) {
        const remaining = selectedFile.size - bytesUploaded;
        setEtaSeconds(Math.round(remaining / speed));
      }
    });

    upload.on("error", (err) => {
      setError(err.detail || "Upload failed");
      setStatus(LESSON_UPLOAD_STATUS.ERROR);
    });

    upload.on("success", () => {
      setProgress(100);
      setEtaSeconds(0);
      setStatus(LESSON_UPLOAD_STATUS.PROCESSING);
      onDirectUploadComplete?.(lessonId);
      pollProcessing();
    });
  };

  // ------------- pause / resume --------------
  const togglePause = () => {
    const upload = uploadRef.current;
    if (!upload || (status !== LESSON_UPLOAD_STATUS.UPLOADING && status !== LESSON_UPLOAD_STATUS.PAUSED)) {
      return;
    }
    if ((upload as any).paused === true) {
      // resume
      if (pauseStartRef.current) {
        totalPausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      upload.resume();
      setStatus(LESSON_UPLOAD_STATUS.UPLOADING);
    } else {
      upload.pause();
      pauseStartRef.current = Date.now();
      setStatus(LESSON_UPLOAD_STATUS.PAUSED);
    }
  };

  // ------------- cancel -----------------------
  const cancelUpload = async () => {
    uploadRef.current?.abort();
    try {
      await fetch(`/api/mux/cancel-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
    } catch (err) {
      console.error("Cancel upload error", err);
    }
    resetState();
    setStatus(LESSON_UPLOAD_STATUS.CANCELLED);
    setSelectedFile(null);
  };

  // ------------ processing polling ------------
  const pollProcessing = () => {
    let cancelled = false;
    let delay = 5000;

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/courses/lessons/${lessonId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch status");
        const data = await res.json();
        const remoteStatus: string | undefined = data.uploadStatus?.toUpperCase();
        if (remoteStatus) {
          setProcessingStatus(remoteStatus);
        }
        if (remoteStatus === "COMPLETED") {
          setStatus(LESSON_UPLOAD_STATUS.COMPLETED);
          try {
            const freshRes = await fetch(`/api/courses/lessons/${lessonId}`, { cache: "no-store" });
            if (freshRes.ok) {
              const lesson = await freshRes.json();
              onProcessingComplete?.(lessonId, lesson);
            }
          } catch {
            /* ignore */
          }
          return; // stop polling
        }
        if (remoteStatus === "CANCELLED") {
          setStatus(LESSON_UPLOAD_STATUS.CANCELLED);
          return;
        }
        // continue polling with back-off
        delay = Math.min(delay * 1.5, 30000);
      } catch (err) {
        console.error("Processing poll error", err);
        delay = Math.min(delay * 1.5, 30000);
      }
      setTimeout(tick, delay);
    };

    setTimeout(tick, delay);
    pollCancelRef.current = () => {
      cancelled = true;
    };
  };

  // Keep statusRef in sync with React state so event handlers read fresh value
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  return {
    // data
    status,
    progress,
    etaSeconds,
    error,
    processingStatus,
    selectedFile,
    // helpers
    formatBytes,
    formatSeconds,
    // actions
    selectFile,
    startUpload,
    togglePause,
    cancelUpload,
  } as const;
} 