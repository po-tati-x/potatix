"use client";

import { LESSON_UPLOAD_STATUS, LessonUploadStatus } from "@/lib/config/upload";

interface ProgressProps {
  status: LessonUploadStatus;
  progress: number;
  etaSeconds: number | null;
}

export function UploadProgress({ status, progress, etaSeconds }: ProgressProps) {
  const show = status === LESSON_UPLOAD_STATUS.UPLOADING || status === LESSON_UPLOAD_STATUS.PAUSED;
  if (!show) return null;
  return (
    <>
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded h-2 overflow-hidden">
        <div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>{progress.toFixed(1)}%</span>
        {etaSeconds != null && <span>ETA: {formatSeconds(etaSeconds)}</span>}
      </div>
    </>
  );
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s}s`;
} 