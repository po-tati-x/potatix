'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { CheckCircle, Circle, Lock, ChevronDown, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import type { CourseModule, CourseLesson } from './types';
import Image from 'next/image';

interface KnowledgeTimelineProps {
  modules: CourseModule[];
  onLessonClick: (lessonId: string) => void;
  currentLessonId?: string;
}

interface LessonItemProps {
  lesson: CourseLesson;
  isCurrent: boolean;
  onLessonClick: (lessonId: string) => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

const LessonItem = memo(function LessonItem({ lesson, isCurrent, onLessonClick }: LessonItemProps) {
  const showProgress =
    typeof lesson.progressPercentage === 'number' &&
    lesson.progressPercentage > 0 &&
    lesson.progressPercentage < 100;
  const isPartial = showProgress && !lesson.isCompleted;

  return (
    <button
      onClick={() => !lesson.isLocked && onLessonClick(lesson.id)}
      disabled={lesson.isLocked}
      className={cn(
        'group relative flex w-full flex-nowrap items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 border',
        isCurrent ? 'border-emerald-500 bg-emerald-50/40' : 'border-transparent',
        !lesson.isLocked && !isCurrent && 'hover:bg-slate-50',
        lesson.isLocked && 'cursor-not-allowed opacity-60',
      )}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {/* Status icon */}
      <div className="relative flex-shrink-0">
        {(() => {
          if (lesson.isCompleted) {
            return <CheckCircle className="h-4 w-4 text-emerald-600" />;
          }
          if (lesson.isLocked) {
            return <Lock className="h-4 w-4 text-slate-400" />;
          }
          if (isPartial) {
            return <Play className="h-4 w-4 text-emerald-500" />;
          }
          return <Circle className={cn('h-4 w-4', isCurrent ? 'text-emerald-600' : 'text-slate-400')} />;
        })()}
        {isCurrent && (
          <div className="absolute -inset-1 animate-ping rounded-full bg-emerald-500/20" />
        )}
      </div>

      {/* Lesson title & meta */}
      <div className="flex flex-1 flex-col min-w-0">
        <span className={cn('truncate text-sm', lesson.isCompleted ? 'text-slate-700' : 'text-slate-900')}>{lesson.title}</span>
        <span className="text-xs text-slate-500">{formatDuration(lesson.duration)}</span>
      </div>

      {/* Progress bar under lesson title */}
      <div className="flex items-center gap-3">
        {showProgress && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1 flex-1 rounded bg-slate-100">
                {(() => {
                  const width = Math.max(6, lesson.progressPercentage ?? 0);
                  return <div className="h-full rounded bg-emerald-500" style={{ width: `${width}%` }} />;
                })()}
              </div>
              <span className="text-[10px] font-medium text-slate-500">{lesson.progressPercentage}%</span>
            </div>
          )}
      </div>

      {isCurrent && (
        <>
          <Play className="h-4 w-4 text-emerald-600" />
          <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-600">
            Watching
          </span>
        </>
      )}

      {!isCurrent && isPartial && (
        <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-yellow-700">
          Resume
        </span>
      )}

      {lesson.thumbnail && (
        <div className="hidden sm:block h-10 w-16 flex-shrink-0 ml-auto overflow-hidden rounded">
          <Image src={lesson.thumbnail} alt="thumb" width={64} height={40} className="object-cover" />
        </div>
      )}
    </button>
  );
});

export function KnowledgeTimeline({
  modules,
  onLessonClick,
  currentLessonId,
}: KnowledgeTimelineProps) {
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  const toggleModule = useCallback((moduleId: string) => {
    setCollapsedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  // Calculate total remaining time
  const totalRemainingTime = useMemo(() => {
    let total = 0;
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.isCompleted && !lesson.isLocked) {
          total += lesson.duration;
        }
      }
    }
    return total;
  }, [modules]);

  const remainingLabel = useMemo(
    () => (totalRemainingTime > 0 ? `${formatDuration(totalRemainingTime)} left` : 'All done!'),
    [totalRemainingTime],
  );

  // Auto-collapse completed modules except if they contain current lesson
  const shouldCollapseByDefault = (module: CourseModule) => {
    const hasCurrentLesson = module.lessons.some(l => l.id === currentLessonId);
    return module.completedCount === module.totalCount && !hasCurrentLesson;
  };

  // Determine the earliest lesson in chronological order that hasn't been completed and is unlocked
  const nextLesson = useMemo(() => {
    const flatLessons = modules.flatMap(m => m.lessons);
    return flatLessons.find(l => !l.isCompleted && !l.isLocked);
  }, [modules]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase text-slate-500">Course Timeline</h3>
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span>{remainingLabel}</span>
        </div>
      </div>

      {nextLesson && (
        <div className="flex items-center gap-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/40 p-4">
          <Play className="h-6 w-6 flex-shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">Up Next</p>
            <p className="line-clamp-2 text-sm text-slate-700">{nextLesson.title}</p>
          </div>
          <button
            onClick={() => onLessonClick(nextLesson.id)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Start
          </button>
        </div>
      )}

      <div className="space-y-3">
        {modules.map(module => {
          const isCollapsed =
            collapsedModules.has(module.id) ||
            (shouldCollapseByDefault(module) && !collapsedModules.has(module.id));
          const isCompleted = module.completedCount === module.totalCount;

          return (
            <div
              key={module.id}
              className={cn(
                'overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors',
                'hover:border-emerald-400',
                isCompleted && 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300',
              )}
            >
              {/* Module header */}
              <button
                onClick={() => toggleModule(module.id)}
                aria-expanded={!isCollapsed}
                className="group flex w-full items-center justify-between p-4 transition-colors hover:bg-emerald-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-slate-400 transition-transform group-hover:text-emerald-600',
                      isCollapsed && '-rotate-90',
                    )}
                  />
                  <div className="text-left">
                    <h4 className="font-medium text-slate-900">{module.title}</h4>
                    {module.description && (
                      <p className="mt-0.5 text-xs text-slate-600">{module.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-medium', isCompleted ? 'text-emerald-600' : 'text-slate-600')}>
                    {module.completedCount}/{module.totalCount}
                  </span>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                </div>
              </button>

              {/* Progress bar under header */}
              <div className="h-1 w-full bg-slate-100">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${(module.completedCount / module.totalCount) * 100}%` }}
                />
              </div>

              {/* Module lessons */}
              {!isCollapsed && (
                <div className="border-t border-slate-100 px-4 pb-4">
                  <div className="mt-2 space-y-1">
                    {module.lessons.map(lesson => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isCurrent={lesson.id === currentLessonId}
                        onLessonClick={onLessonClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
