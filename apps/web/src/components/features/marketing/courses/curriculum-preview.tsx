'use client';

import { useState, useMemo, memo, useCallback } from 'react';
import { Clock, Play, ChevronDown, CheckCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Course, CourseModule, Lesson } from '@/lib/shared/types/courses';
import { cn } from '@/lib/shared/utils/cn';
import { Section } from '@/components/ui/section';

interface CurriculumPreviewProps {
  course: Course;
}

// Human-readable duration
function fmt(sec = 0): string {
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

// A lesson is previewable when its visibility is set to 'public' (set by instructor)

export function CurriculumPreview({ course }: CurriculumPreviewProps) {
  // Stabilise array references so that memo deps stay consistent
  const modules = useMemo(() => course.modules ?? [], [course.modules]);
  const lessons = useMemo(() => course.lessons ?? [], [course.lessons]);

  // Derived aggregate data from lessons
  const { totalSeconds, lessonMap } = useMemo(() => {
    const map: Record<string, typeof lessons> = {};
    let seconds = 0;
    for (const l of lessons) {
      seconds += l.duration ?? 0;
      if (!l.moduleId) continue;
      (map[l.moduleId] ||= []).push(l);
    }
    return { totalSeconds: seconds, lessonMap: map };
  }, [lessons]);

  // Track which module accordions are expanded
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const [idx, m] of modules.entries()) {
      initial[m.id] = idx === 0; // first module open by default
    }
    return initial;
  });

  // Stable toggler to avoid redefining hooks inside loops
  const toggleModule = useCallback((id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <Section bg="white" className="pt-24 pb-12" aria-labelledby="curriculum-heading">
      <div className="space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <h2 id="curriculum-heading" className="text-3xl font-semibold tracking-tight text-slate-800">
            Curriculum overview
          </h2>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {modules.length} modules
            </span>
            <span className="flex items-center gap-1">
              <Play className="h-4 w-4" /> {lessons.length} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {fmt(totalSeconds)} total
            </span>
          </div>
        </header>

        {/* Module list */}
        <ul className="space-y-4">
          {modules.map((module, idx) => {
            const list = lessonMap[module.id] ?? [];
            const modSeconds = list.reduce((a, l) => a + (l.duration ?? 0), 0);
            const open = openIds[module.id] ?? false;

            return (
              <ModuleRow
                key={module.id}
                module={module}
                idx={idx}
                lessons={list}
                modSeconds={modSeconds}
                open={open}
                toggle={() => toggleModule(module.id)}
              />
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

// ──────────────────────────
// Memoized child components
// ──────────────────────────

interface ModuleRowProps {
  module: CourseModule;
  idx: number;
  lessons: Lesson[];
  modSeconds: number;
  open: boolean;
  toggle: () => void;
}

const ModuleRow = memo(function ModuleRow({ module, idx, lessons, modSeconds, open, toggle }: ModuleRowProps) {
  return (
    <motion.li className="overflow-hidden rounded-md border border-slate-200 bg-white" layout>
      {/* Header */}
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-medium text-white">
            {idx + 1}
          </span>
          <div className="text-start">
            <h3 className="font-medium text-slate-900">{module.title}</h3>
            <p className="text-xs text-slate-600">
              {lessons.length} lessons • {fmt(modSeconds)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 text-slate-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {/* Animated content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            className="divide-y divide-slate-100"
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            layout
          >
            {lessons.map((l: Lesson, lIdx: number) => {
              const preview = l.visibility === 'public';
              return (
                <li
                  key={l.id}
                  className={cn(
                    'flex items-center justify-between gap-4 px-4 py-3',
                    preview && 'bg-emerald-50/50',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        preview ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600',
                      )}
                    >
                      {lIdx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{l.title}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" /> {fmt(l.duration)}
                      </div>
                    </div>
                  </div>
                  {preview ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">
                      <Play className="h-3 w-3" /> Preview
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <CheckCircle className="h-3 w-3" /> Included
                    </span>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
});
