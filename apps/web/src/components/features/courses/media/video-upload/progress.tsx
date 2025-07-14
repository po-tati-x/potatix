"use client";

import { LESSON_UPLOAD_STATUS, LessonUploadStatus } from "@/lib/config/upload";

interface ProgressProps {
  status: LessonUploadStatus;
  progress: number;
  etaSeconds?: number;
  formatSeconds: (sec: number) => string;
}

export function UploadProgress({ status, progress, etaSeconds, formatSeconds }: ProgressProps) {
  const show = status === LESSON_UPLOAD_STATUS.UPLOADING;
  if (!show) return;
  return (
    <>
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded h-2 overflow-hidden">
        <div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>{progress.toFixed(1)}%</span>
        {etaSeconds !== undefined && <span>ETA: {formatSeconds(etaSeconds)}</span>}
      </div>
    </>
  );
} 