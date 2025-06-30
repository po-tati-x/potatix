'use client';

import { Play, Clock } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/new-button';
import type { CourseProgress } from './types';

interface ResumeTileProps {
  progress: CourseProgress;
  courseSlug: string;
  onResume: () => void;
}

export function ResumeTile({ progress, onResume }: ResumeTileProps) {
  let progressPercentage = 0;
  if (progress.totalDuration > 0) {
    progressPercentage = Math.round((progress.lastWatchedPosition / progress.totalDuration) * 100);
  } else {
    progressPercentage = Math.round(progress.percentComplete);
  }
  progressPercentage = Math.min(100, Math.max(0, progressPercentage));
  const safeDuration = progress.totalDuration || 0;
  const remainingTime = safeDuration > 0 ? safeDuration - progress.lastWatchedPosition : 0;
  const remainingMinutes = Math.max(0, Math.ceil(remainingTime / 60));

  // Calculate progress ring
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden rounded-lg border border-slate-200 bg-white p-6 transition hover:border-emerald-500 md:flex-row md:items-center">
      {/* Thumbnail (first on mobile) */}
      <div className="relative shrink-0 w-full aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-100 md:w-64 md:self-stretch">
        {progress.currentLessonThumbnail ? (
          <Image
            src={progress.currentLessonThumbnail}
            alt={progress.currentLessonTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 256px"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className="h-9 w-9 text-slate-400" />
          </div>
        )}

        {/* Linear watch progress */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/10">
          <div
            className="h-full bg-emerald-600"
            style={{ width: `${safeDuration > 0 ? (progress.lastWatchedPosition / safeDuration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Lesson details */}
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-600">Continue where you left off</p>
          <h2 className="mt-1 line-clamp-2 text-lg font-medium text-slate-900 md:text-xl">
            {progress.currentLessonTitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{remainingMinutes} min remaining</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <span>
            {progress.completedLessons.length} of {progress.totalLessons} lessons complete
          </span>
        </div>

        <div className="mt-auto">
          <Button
            type="primary"
            size="small"
            onClick={onResume}
            iconLeft={<Play className="h-4 w-4" />}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Resume Lesson
          </Button>
        </div>
      </div>

      {/* Progress ring (desktop) */}
      <div className="hidden md:flex shrink-0 items-center justify-center ml-auto">
        <div className="relative h-20 w-20">
          <svg className="h-full w-full -rotate-90 transform">
            <circle cx="50%" cy="50%" r={radius} strokeWidth="6" className="text-slate-200" fill="none" stroke="currentColor" />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              strokeWidth="6"
              className="text-emerald-500 transition-all duration-500"
              fill="none"
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-900">{progressPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
