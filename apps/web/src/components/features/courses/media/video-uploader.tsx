"use client";

import {
  AlertCircle,
  Loader2,
  Upload,
  Pause as PauseIcon,
  Play as PlayIcon,
  X as CancelIcon,
  Film as FilmIcon,
  CheckCircle,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/new-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import * as UpChunk from "@mux/upchunk";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
// UpChunk expects chunk size in **KB** – keep bytes for clarity then convert.
const CHUNK_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB per chunk (multiple of 256 KB)
const MAX_FETCH_RETRIES = 3; // attempts to obtain direct-upload URL

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s}s`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface VideoUploaderProps {
  lessonId: string;
  onDirectUploadComplete?: (lessonId: string) => void;
  /**
   * Optional callback for parent-level optimistic UI updates.
   * Accepts a File or the raw <input> change event for backward compatibility.
   */
  onFileChange?: (
    fileOrEvent: File | React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
}

export function VideoUploader({
  lessonId,
  onDirectUploadComplete,
  onFileChange,
}: VideoUploaderProps) {
  // ------------------------------ State ------------------------------------
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // 0‒100
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [status, setStatus] = useState<
    | "idle"
    | "preparing"
    | "uploading"
    | "paused"
    | "success"
    | "error"
  >("idle");
  const [isDragActive, setIsDragActive] = useState(false);

  // ---------------------------- Refs --------------------------------------
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  type UpChunkInstance = ReturnType<typeof UpChunk.createUpload>;
  const uploadRef = useRef<UpChunkInstance | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef(0);
  const pollCancelRef = useRef<(() => void) | null>(null);

  // Abort on unmount
  useEffect(() => {
    return () => uploadRef.current?.abort();
  }, []);

  // -------------------------- Utils ---------------------------------------
  const resetState = useCallback(() => {
    // Abort any in-flight upload to avoid zombie chunks
    uploadRef.current?.abort();
    // Stop any active processing poll
    pollCancelRef.current?.();
    pollCancelRef.current = null;
    setProgress(0);
    setEtaSeconds(null);
    setStatus("idle");
    setError(null);
    uploadRef.current = null;
    startTimeRef.current = null;
    pauseStartRef.current = null;
    totalPausedTimeRef.current = 0;
  }, []);

  // Validate & pick file ----------------------------------------------------
  function handleFile(file: File) {
    try {
      if (!file.type.startsWith("video/")) {
        throw new Error("Only video files are allowed");
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("File too large (max 2 GB)");
      }
      setSelectedFile(file);
      onFileChange?.(file, lessonId);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid file");
      setSelectedFile(null);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetState();
    handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      resetState();
      handleFile(file);
    }
  };

  // -------------------------------- Upload --------------------------------
  const startUpload = async () => {
    if (!selectedFile || (status !== "idle" && status !== "error")) return; // guard double-clicks
    setStatus("preparing");
    setError(null);

    async function fetchUploadUrl(): Promise<string> {
      for (let attempt = 0; attempt < MAX_FETCH_RETRIES; attempt++) {
        try {
          const res = await fetch("/api/mux/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId }),
          });
          if (!res.ok) throw new Error("Failed to get upload URL");
          const { url } = (await res.json()) as { url: string };
          return url;
        } catch (error) {
          if (attempt === MAX_FETCH_RETRIES - 1) throw error;
          // primitive back-off – wait 0.5s, 1s …
          await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        }
      }
      throw new Error("Unreachable");
    }

    let uploadUrl: string;
    try {
      uploadUrl = await fetchUploadUrl();
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to start upload");
      setStatus("error");
      return;
    }

    // Create upload instance
    const upload = UpChunk.createUpload({
      endpoint: uploadUrl,
      file: selectedFile,
      chunkSize: CHUNK_SIZE_BYTES / 1024, // convert bytes → KB as required
      dynamicChunkSize: true,
    });
    uploadRef.current = upload;
    startTimeRef.current = Date.now();
    totalPausedTimeRef.current = 0;
    setStatus("uploading");

    upload.on("progress", (p) => {
      const percent = p.detail as number;
      setProgress(percent);

      if (startTimeRef.current) {
        const elapsed =
          (Date.now() - (startTimeRef.current ?? Date.now()) -
            totalPausedTimeRef.current) /
          1000; // seconds minus pauses
        const bytesUploaded = (selectedFile.size * percent) / 100;
        const speed = bytesUploaded / Math.max(elapsed, 1); // B/s
        if (speed > 0) {
          const remaining = selectedFile.size - bytesUploaded;
          setEtaSeconds(Math.round(remaining / speed));
        }
      }
    });

    upload.on("error", (err) => {
      console.error(err.detail);
      setError(err.detail || "Upload failed");
      setStatus("error");
    });

    upload.on("success", () => {
      setProgress(100);
      setEtaSeconds(0);
      setStatus("success");
      // Kick off backend polling to watch mux processing → playback ready
      pollCancelRef.current = pollLessonProcessing();
      onDirectUploadComplete?.(lessonId);
      // Clear file input but keep selectedFile so UI shows success
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  // Pause / resume ----------------------------------------------------------
  const togglePause = () => {
    const upload = uploadRef.current;
    if (!upload) return;
    if (upload.paused) {
      // Resume
      if (pauseStartRef.current != null) {
        totalPausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
      upload.resume();
      setStatus("uploading");
    } else {
      upload.pause();
      pauseStartRef.current = Date.now();
      setStatus("paused");
    }
  };

  const cancelUpload = () => {
    uploadRef.current?.abort();
    pollCancelRef.current?.();
    pollCancelRef.current = null;
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFile(null);
  };

  // -------------------- Processing polling ------------------------------
  const pollLessonProcessing = useCallback(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/courses/lessons/${lessonId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch lesson status");
        const data = await res.json();
        const remoteStatus = data.uploadStatus as string | undefined;
        if (remoteStatus) setProcessingStatus(remoteStatus.toUpperCase());

        if (!cancelled && remoteStatus && remoteStatus.toUpperCase() !== "COMPLETED" && remoteStatus.toUpperCase() !== "FAILED") {
          setTimeout(fetchStatus, 5000); // retry in 5s
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Processing status fetch error", err);
          // keep polling but back off a bit
          setTimeout(fetchStatus, 10000);
        }
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      uploadRef.current?.abort();
      pollCancelRef.current?.();
    };
  }, []);

  // ------------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------------
  if (status === "preparing") {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 text-center bg-white dark:bg-slate-900 space-y-3">
        <Loader2 className="h-6 w-6 text-slate-400 dark:text-slate-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Fetching secure upload URL…</p>
        <Button
          type="outline"
          size="small"
          icon={<CancelIcon className="h-3.5 w-3.5" />}
          onClick={cancelUpload}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-md p-4 bg-white dark:bg-slate-900 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-slate-700 dark:text-slate-200">
          Upload Video
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Drag & drop or click to select a video file
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={
          `relative cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors ` +
          (isDragActive ? "border-emerald-500 bg-emerald-50/20" : "border-slate-300 hover:border-emerald-500") +
          " dark:border-slate-600 dark:hover:border-emerald-500 max-w-lg mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        }
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        aria-label="Select video file"
      >
        {selectedFile ? (
          status === "success" && processingStatus === "COMPLETED" ? (
            <div className="flex flex-col items-center gap-1">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-500 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Video ready
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <FilmIcon className="h-6 w-6 text-emerald-600" />
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-full">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatBytes(selectedFile.size)}
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
            <Upload className="h-6 w-6" />
            <span className="text-xs">Drop file here or click to browse</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {(status === "idle" || status === "error") && (
          <Button
            type="primary"
            size="small"
            iconLeft={<Upload className="h-3.5 w-3.5" />}
            onClick={startUpload}
            disabled={!selectedFile}
          >
            {status === "error" ? "Retry Upload" : "Start Upload"}
          </Button>
        )}

        {status === "uploading" && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="outline"
                  size="small"
                  icon={<PauseIcon className="h-3.5 w-3.5" />}
                  onClick={togglePause}
                  aria-label="Pause upload"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Pause</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="outline"
                  size="small"
                  icon={<CancelIcon className="h-3.5 w-3.5" />}
                  onClick={cancelUpload}
                  aria-label="Cancel upload"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {status === "paused" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="outline"
                size="small"
                icon={<PlayIcon className="h-3.5 w-3.5" />}
                onClick={togglePause}
                aria-label="Resume upload"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Resume</p>
            </TooltipContent>
          </Tooltip>
        )}

        {status === "success" && (
          processingStatus === "COMPLETED" ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-500 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Video ready
            </p>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…
            </p>
          )
        )}
      </div>

      {/* Progress bar */}
      {(status === "uploading" || status === "paused") && (
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Progress details */}
      {(status === "uploading" || status === "paused") && (
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>{progress.toFixed(1)}%</span>
          {etaSeconds != null && (
            <span>ETA: {formatSeconds(etaSeconds)}</span>
          )}
        </div>
      )}

      {status === "error" && error && (
        <div className="flex items-center text-red-600 text-xs gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
