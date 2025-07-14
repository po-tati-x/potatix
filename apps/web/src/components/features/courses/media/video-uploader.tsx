"use client";

import { UploadDropzone } from "./video-upload/dropzone";
import { UploadControls } from "./video-upload/controls";
import { UploadProgress } from "./video-upload/progress";
import { useVideoUpload } from "@/hooks/use-video-upload";
import { LESSON_UPLOAD_STATUS, LessonUploadStatus } from "@/lib/config/upload";
import { Loader2, X as CancelIcon } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { ProcessingBanner } from "./video-upload/processing-banner";

interface VideoUploaderProps {
  lessonId: string;
  onDirectUploadComplete?: (lessonId: string) => void;
  onProcessingComplete?: (lessonId: string, lesson?: unknown) => void;
  onFileChange?: (
    fileOrEvent: File | React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
  /** Initial upload status coming from the database when the page loads. */
  initialStatus?: LessonUploadStatus;
}

export function VideoUploader(props: VideoUploaderProps) {
  const {
    status,
    progress,
    etaSeconds,
    error,
    selectedFile,
    formatBytes,
    formatSeconds,
    selectFile,
    startUpload,
    cancelUpload,
  } = useVideoUpload(props);

  if (status === LESSON_UPLOAD_STATUS.PREPARING) {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 text-center bg-white dark:bg-slate-900 space-y-3 flex flex-col items-center">
        <Loader2 className="h-6 w-6 text-slate-400 dark:text-slate-500 animate-spin" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Fetching secure upload URL…</p>
        <Button
          type="outline"
          size="small"
          iconLeft={<CancelIcon className="h-3.5 w-3.5" />}
          onClick={() => {
            void cancelUpload();
          }}
          className="mt-2"
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (status === LESSON_UPLOAD_STATUS.PROCESSING) {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-md p-4 bg-white dark:bg-slate-900">
        <ProcessingBanner />
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-md p-4 bg-white dark:bg-slate-900 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-slate-700 dark:text-slate-200">Upload Video</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">Drag & drop or click to select a video file</p>
      </div>

      {/* Dropzone */}
      {status === LESSON_UPLOAD_STATUS.UPLOADING && !selectedFile ? (
        <div className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 border border-dashed border-slate-300 rounded-md p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 12V8a4 4 0 014-4h8a4 4 0 014 4v4" /></svg>
          <p className="text-xs">Uploading…</p>
        </div>
      ) : (
        <UploadDropzone
          selectedFile={selectedFile}
          onSelect={selectFile}
          formatBytes={formatBytes}
          disabled={status !== LESSON_UPLOAD_STATUS.IDLE && status !== LESSON_UPLOAD_STATUS.ERROR}
        />
      )}

      {/* Controls */}
      <UploadControls
        status={status}
        selectedFile={selectedFile}
        error={error}
        onStart={() => {
          void startUpload();
        }}
        onCancel={() => {
          void cancelUpload();
        }}
      />

      {/* Progress */}
      <UploadProgress status={status} progress={progress} etaSeconds={etaSeconds} formatSeconds={formatSeconds} />
    </div>
  );
}
