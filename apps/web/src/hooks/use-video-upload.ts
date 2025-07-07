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
   * status from the database so the hook can resume polling insteads from scratch.
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
  const pollCancelRef = useRef<(() => void) | null>(null);
  const statusRef = useRef<LessonUploadStatus>(initialStatus);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      uploadRef.current?.abort();
      pollCancelRef.current?.();
    };
  }, []);

  // Resume-on-refresh disabled – no localStorage inspection

  // Kick off polling immediately if we mounted in PROCESSING state
  useEffect(() => {
    if (initialStatus === LESSON_UPLOAD_STATUS.PROCESSING) {
      subscribeProcessing();
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
      throw new Error(`File too large (max ${formatBytes(UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES)})`);
    }
  }

  const selectFile = (file: File) => {
    try {
      validateFile(file);
      // Always reset – resume is gone.
      resetState();
      setSelectedFile(file);
      onFileChange?.(file, lessonId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ------------- upload -----------------------
  const startUpload = async () => {
    if (!selectedFile) return;

    if (status !== LESSON_UPLOAD_STATUS.IDLE) return;

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

    // persistence disabled

    createAndStartUpload(uploadUrl);
  };

  // helper to create upload and wire events
  function createAndStartUpload(endpoint: string) {
    if (!selectedFile) return;

    const upload = UpChunk.createUpload({
      endpoint,
      file: selectedFile,
      chunkSize: UPLOAD_CONFIG.CHUNK_SIZE_BYTES / 1024, // KB
    });
    uploadRef.current = upload;
    startTimeRef.current = Date.now();
    setStatus(LESSON_UPLOAD_STATUS.UPLOADING);
    statusRef.current = LESSON_UPLOAD_STATUS.UPLOADING;

    upload.on("progress", ({ detail }) => {
      if (statusRef.current !== LESSON_UPLOAD_STATUS.UPLOADING) return; // ignore events when not actively uploading
      const percent = detail as number;
      setProgress(percent);

      // progress persistence disabled

      const start = startTimeRef.current;
      if (!start) return;
      const elapsed = (Date.now() - start) / 1000;
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
      // no persistence cleanup needed
      setProgress(100);
      setEtaSeconds(0);
      setStatus(LESSON_UPLOAD_STATUS.PROCESSING);

      // Persist status immediately so a page refresh reflects "PROCESSING"
      // Use keepalive to maximise chance the request completes even if user navigates away
      fetch(`/api/courses/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadStatus: "processing" }),
        keepalive: true,
      }).catch(() => {
        /* Network errors are non-fatal here – webhook will eventually update */
      });

      onDirectUploadComplete?.(lessonId);
      subscribeProcessing();
    });
  }

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

  // ------------ processing updates via SSE / fallback polling ------------

  function subscribeProcessing() {
    // close existing listener / poller if any
    pollCancelRef.current?.();

    let retries = 0;
    let es: EventSource | null = null;

    const stop = () => {
      es?.close();
      es = null;
    };

    const connect = () => {
      stop();
      es = new EventSource(`/api/courses/lessons/${lessonId}/events`);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const remoteStatus: string | undefined = data.status?.toUpperCase();
          if (remoteStatus) setProcessingStatus(remoteStatus);

          if (remoteStatus === "COMPLETED") {
            setStatus(LESSON_UPLOAD_STATUS.COMPLETED);
            onProcessingComplete?.(lessonId, data.lesson);
            stop();
          }
          if (remoteStatus === "CANCELLED") {
            setStatus(LESSON_UPLOAD_STATUS.CANCELLED);
            stop();
          }
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      es.onerror = () => {
        stop();
        retries += 1;
        if (retries < 3) {
          const delay = Math.min(2 ** retries * 1000, 30000);
          setTimeout(connect, delay);
        } else {
          // fallback to polling
          pollProcessing();
        }
      };
    };

    connect();

    // expose canceller using same ref for cleanup consistency
    pollCancelRef.current = () => {
      stop();
    };
  }

  // ------------ processing polling ------------
  const pollProcessing = () => {
    let cancelled = false;
    let delay = 5000;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const stopPolling = () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };

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
          stopPolling();
          return; // stop polling
        }
        if (remoteStatus === "CANCELLED") {
          setStatus(LESSON_UPLOAD_STATUS.CANCELLED);
          stopPolling();
          return;
        }
        // continue polling with back-off
        delay = Math.min(delay * 1.5, 30000);
      } catch (err) {
        console.error("Processing poll error", err);
        delay = Math.min(delay * 1.5, 30000);
      }
      timerId = setTimeout(tick, delay);
    };

    timerId = setTimeout(tick, delay);
    pollCancelRef.current = stopPolling;
  };

  // Keep statusRef in sync with React state so event handlers read fresh value
  useEffect(() => {
    statusRef.current = status;
    if (typeof window !== 'undefined') {
      const handler = (e: BeforeUnloadEvent) => {
        if (status === LESSON_UPLOAD_STATUS.UPLOADING) {
          const msg = 'A lesson upload is in progress. Leaving this page will cancel the upload.';
          e.preventDefault();
          e.returnValue = msg;
        }
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
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
    cancelUpload,
  } as const;
} 