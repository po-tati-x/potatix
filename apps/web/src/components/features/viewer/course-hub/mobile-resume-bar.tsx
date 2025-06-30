'use client';

import { Play, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import type { CourseProgress } from './types';

interface MobileResumeBarProps {
  progress: CourseProgress;
  isVisible: boolean;
  onResume: () => void;
  onExpand?: () => void;
}

export function MobileResumeBar({ progress, isVisible, onResume, onExpand }: MobileResumeBarProps) {
  const progressPercentage = Math.round(progress.percentComplete);
  const remainingTime = progress.totalDuration - progress.lastWatchedPosition;
  const remainingMinutes = Math.ceil(remainingTime / 60);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm transition-transform duration-300 lg:hidden',
        isVisible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {/* Progress bar at top */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-slate-100">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="safe-area-pb px-4 pb-4 pt-3">
        <div className="flex items-center gap-3">
          {/* Lesson info */}
          <div className="flex-grow">
            <button onClick={onExpand} className="flex w-full items-start gap-1 text-left">
              <div className="flex-grow">
                <p className="line-clamp-1 text-sm font-medium text-slate-900">
                  {progress.currentLessonTitle}
                </p>
                <p className="text-xs text-slate-500">
                  {remainingMinutes} min left • {progressPercentage}% complete
                </p>
              </div>
              {onExpand && <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-400" />}
            </button>
          </div>

          {/* Resume button */}
          <button
            onClick={onResume}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white transition-all active:scale-95"
            aria-label="Resume lesson"
          >
            <Play className="h-5 w-5 translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
