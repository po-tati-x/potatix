"use client";

import { UploadDropzone } from "./video-upload/dropzone";
import { UploadControls } from "./video-upload/controls";
import { UploadProgress } from "./video-upload/progress";
import { useVideoUpload } from "@/hooks/use-video-upload";
import { LESSON_UPLOAD_STATUS, LessonUploadStatus } from "@/lib/config/upload";
import { Loader2 } from "lucide-react";
import { ProcessingBanner } from "./video-upload/processing-banner";

interface VideoUploaderProps {
  lessonId: string;
  onDirectUploadComplete?: (lessonId: string) => void;
  onProcessingComplete?: (lessonId: string, lesson?: any) => void;
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
    processingStatus,
    selectedFile,
    formatBytes,
    selectFile,
    startUpload,
    cancelUpload,
  } = useVideoUpload(props);

  if (status === LESSON_UPLOAD_STATUS.PREPARING) {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 text-center bg-white dark:bg-slate-900 space-y-3">
        <Loader2 className="h-6 w-6 text-slate-400 dark:text-slate-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Fetching secure upload URL…</p>
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
      <UploadDropzone selectedFile={selectedFile} onSelect={selectFile} formatBytes={formatBytes} disabled={status!==LESSON_UPLOAD_STATUS.IDLE && status!==LESSON_UPLOAD_STATUS.ERROR}/>

      {/* Controls */}
      <UploadControls
        status={status}
        processingStatus={processingStatus}
        selectedFile={selectedFile}
        error={error}
        onStart={startUpload}
        onCancel={cancelUpload}
      />

      {/* Progress */}
      <UploadProgress status={status} progress={progress} etaSeconds={etaSeconds} />
    </div>
  );
}
