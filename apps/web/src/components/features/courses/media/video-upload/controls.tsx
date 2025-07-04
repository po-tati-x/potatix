"use client";

import { Button } from "@/components/ui/new-button";
import { LESSON_UPLOAD_STATUS, LessonUploadStatus } from "@/lib/config/upload";
import {
  Upload,
  X as CancelIcon,
  CheckCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ControlsProps {
  status: LessonUploadStatus;
  processingStatus: string | null;
  selectedFile: File | null;
  error: string | null;
  onStart: () => void;
  onCancel: () => void;
}

export function UploadControls({
  status,
  selectedFile,
  error,
  onStart,
  onCancel,
}: ControlsProps) {
  if (status === LESSON_UPLOAD_STATUS.PROCESSING) return null;
  return (
    <div className="flex items-center gap-2">
      {(status === LESSON_UPLOAD_STATUS.IDLE || status === LESSON_UPLOAD_STATUS.ERROR) && (
        <Button
          type="primary"
          size="small"
          iconLeft={<Upload className="h-3.5 w-3.5" />}
          onClick={onStart}
          disabled={!selectedFile}
        >
          {status === LESSON_UPLOAD_STATUS.ERROR ? "Retry Upload" : "Start Upload"}
        </Button>
      )}

      {(status === LESSON_UPLOAD_STATUS.UPLOADING || status === LESSON_UPLOAD_STATUS.PAUSED) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="outline"
              size="small"
              icon={<CancelIcon className="h-3.5 w-3.5" />}
              onClick={onCancel}
              aria-label="Cancel upload"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Cancel</p>
          </TooltipContent>
        </Tooltip>
      )}

      {status === LESSON_UPLOAD_STATUS.COMPLETED && (
        <p className="text-xs text-emerald-700 dark:text-emerald-500 flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" /> Video ready
        </p>
      )}

      {status === LESSON_UPLOAD_STATUS.CANCELLED && (
        <p className="text-xs text-slate-500">Upload cancelled</p>
      )}

      {error && status === LESSON_UPLOAD_STATUS.ERROR && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
} 