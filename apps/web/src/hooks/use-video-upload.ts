"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as UpChunk from "@mux/upchunk";
import { LESSON_UPLOAD_STATUS, UPLOAD_CONFIG, LessonUploadStatus } from "@/lib/config/upload";

// Helper to fetch a new Mux direct upload URL – extracted for stable reference
async function fetchUploadUrl(lessonId: string): Promise<string> {
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
    } catch (error_) {
      if (attempt === UPLOAD_CONFIG.MAX_FETCH_RETRIES - 1) throw error_;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  throw new Error("Unreachable");
}

interface UseVideoUploadParams {
  lessonId: string;
  onDirectUploadComplete?: (lessonId: string) => void;
  onProcessingComplete?: (lessonId: string, lesson?: unknown) => void;
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
  const [etaSeconds, setEtaSeconds] = useState<number | undefined>(void 0);
  const [error, setError] = useState<string | undefined>(void 0);
  const [processingStatus, setProcessingStatus] = useState<string | undefined>(void 0);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(void 0);

  // ---------------- refs ------------------
  type UpChunkInstance = ReturnType<typeof UpChunk.createUpload>;
  const uploadRef = useRef<UpChunkInstance | undefined>(void 0);
  const startTimeRef = useRef<number | undefined>(void 0);
  const pollCancelRef = useRef<(() => void) | undefined>(void 0);
  const statusRef = useRef<LessonUploadStatus>(initialStatus);

  // ---------- stable setter helpers ----------
  const updateStatus = useCallback((newStatus: LessonUploadStatus) => {
    setStatus(newStatus);
  }, []);

  const updateProcessingStatus = useCallback((newStatus?: string) => {
    setProcessingStatus(newStatus);
  }, []);

  // ------------- helpers ------------------
  function resetState() {
    uploadRef.current?.abort();
    pollCancelRef.current?.();

    setProgress(0);
    setEtaSeconds(void 0);
    setError(void 0);
    setStatus(LESSON_UPLOAD_STATUS.IDLE);
    setProcessingStatus(void 0);

    // refs
    startTimeRef.current = void 0;
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
    } catch (error_) {
      setError((error_ as Error).message);
    }
  };

  // ------------- upload -----------------------
  const startUpload = async () => {
    if (!selectedFile) return;

    if (status !== LESSON_UPLOAD_STATUS.IDLE) return;

    setStatus(LESSON_UPLOAD_STATUS.PREPARING);
    setError(void 0);

    let uploadUrl: string;
    try {
      uploadUrl = await fetchUploadUrl(lessonId);
    } catch (error_) {
      setError((error_ as Error).message);
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
      setError(String(err.detail) || "Upload failed");
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
    } catch (error_) {
      console.error("Cancel upload error", error_);
    }
    resetState();
    setStatus(LESSON_UPLOAD_STATUS.CANCELLED);
    setSelectedFile(void 0);
  };

  // ------------ processing polling ------------
  const pollProcessing = useCallback(() => {
    let cancelled = false;
    let delay = 5000;
    let timerId: ReturnType<typeof setTimeout> | undefined = void 0;

    const stopPolling = () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/courses/lessons/${lessonId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch status");
        const raw: unknown = await res.json();
        const uploadStatus =
          typeof raw === "object" &&
          raw !== null &&
          "uploadStatus" in raw &&
          typeof (raw as Record<string, unknown>).uploadStatus === "string"
            ? (raw as { uploadStatus: string }).uploadStatus
            : undefined;
        const remoteStatus: string | undefined = uploadStatus?.toUpperCase();
        if (remoteStatus) {
          updateProcessingStatus(remoteStatus);
        }
        if (remoteStatus === "COMPLETED") {
          updateStatus(LESSON_UPLOAD_STATUS.COMPLETED);
          try {
            const freshRes = await fetch(`/api/courses/lessons/${lessonId}`, { cache: "no-store" });
            if (freshRes.ok) {
              const lesson: unknown = await freshRes.json();
              onProcessingComplete?.(lessonId, lesson);
            }
          } catch {
            /* ignore */
          }
          stopPolling();
          return; // stop polling
        }
        if (remoteStatus === "CANCELLED") {
          updateStatus(LESSON_UPLOAD_STATUS.CANCELLED);
          stopPolling();
          return;
        }
        // continue polling with back-off
        delay = Math.min(delay * 1.5, 30_000);
      } catch (error_) {
        console.error("Processing poll error", error_);
        delay = Math.min(delay * 1.5, 30_000);
      }
      timerId = setTimeout(() => {
        void tick();
      }, delay);
    };

    timerId = setTimeout(() => {
      void tick();
    }, delay);
    pollCancelRef.current = stopPolling;
  }, [lessonId, onProcessingComplete, updateProcessingStatus, updateStatus]);

  // ------------ processing updates via SSE / fallback polling ------------

  const subscribeProcessing = useCallback(() => {
    // close existing listener / poller if any
    pollCancelRef.current?.();

    let retries = 0;
    let es: EventSource | undefined = void 0;

    const stop = () => {
      es?.close();
      es = void 0;
    };

    const connect = () => {
      stop();
      es = new EventSource(`/api/courses/lessons/${lessonId}/events`);
      const handleMessage = (e: MessageEvent) => {
        try {
          const parsed: unknown = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          const statusField =
            typeof parsed === "object" &&
            parsed !== null &&
            "status" in parsed &&
            typeof (parsed as Record<string, unknown>).status === "string"
              ? (parsed as { status: string }).status
              : undefined;
          const lessonData =
            typeof parsed === "object" && parsed !== null && "lesson" in parsed
              ? (parsed as Record<string, unknown>).lesson
              : undefined;

          const remoteStatus: string | undefined = statusField?.toUpperCase();
          if (remoteStatus) updateProcessingStatus(remoteStatus);

          if (remoteStatus === "COMPLETED") {
            updateStatus(LESSON_UPLOAD_STATUS.COMPLETED);
            onProcessingComplete?.(lessonId, lessonData);
            stop();
          }
          if (remoteStatus === "CANCELLED") {
            updateStatus(LESSON_UPLOAD_STATUS.CANCELLED);
            stop();
          }
        } catch (error_) {
          console.error("SSE parse error", error_);
        }
      };

      es.addEventListener("message", handleMessage);

      const handleError = () => {
        stop();
        retries += 1;
        if (retries < 3) {
          const delay = Math.min(2 ** retries * 1000, 30_000);
          setTimeout(connect, delay);
        } else {
          // fallback to polling
          pollProcessing();
        }
      };

      es.addEventListener("error", handleError);
    };

    connect();

    // expose canceller using same ref for cleanup consistency
    pollCancelRef.current = () => {
      stop();
    };
  }, [lessonId, onProcessingComplete, pollProcessing, updateProcessingStatus, updateStatus]);

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
  }, [initialStatus, subscribeProcessing]);

  // Keep statusRef in sync with React state so event handlers read fresh value
  useEffect(() => {
    statusRef.current = status;
    if (globalThis.window !== undefined) {
      const handler = (e: BeforeUnloadEvent) => {
        if (status === LESSON_UPLOAD_STATUS.UPLOADING) {
          const msg = 'A lesson upload is in progress. Leaving this page will cancel the upload.';
          e.preventDefault();
          e.returnValue = msg;
        }
      };
      globalThis.window.addEventListener('beforeunload', handler);
      return () => globalThis.window.removeEventListener('beforeunload', handler);
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