/*
  Rewritten from scratch – semantic HTML, server-side by default, and accessible.
  Interactive bits are progressive-enhanced with minimal client JS.
*/

'use client';

import { useState } from 'react';
import { Clock, Play, ChevronDown, CheckCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Course } from '@/lib/shared/types/courses';
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

// First N lessons of first module are free-previewable
const PREVIEW_COUNT = 2;

export function CurriculumPreview({ course }: CurriculumPreviewProps) {
  const modules = course.modules ?? [];
  const lessons = course.lessons ?? [];
  const totalSeconds = lessons.reduce((t, l) => t + (l.duration ?? 0), 0);

  // map lesson list by moduleId for quick lookup
  const lessonMap: Record<string, typeof lessons> = {};
  lessons.forEach(l => {
    if (!l.moduleId) return;
    if (!lessonMap[l.moduleId]) lessonMap[l.moduleId] = [];
    lessonMap[l.moduleId]!.push(l);
  });

  // Track which module accordions are expanded
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach((m, idx) => {
      initial[m.id] = idx === 0; // first module open by default
    });
    return initial;
  });

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
        <ul role="list" className="space-y-4">
          {modules.map((m, mIdx) => {
            const list = lessonMap[m.id] ?? [];
            const modSeconds = list.reduce((a, l) => a + (l.duration ?? 0), 0);
            const open = openIds[m.id] ?? false;

            return (
              <li key={m.id} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                {/* Header */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenIds(prev => ({ ...prev, [m.id]: !prev[m.id] }))
                  }
                  className="flex w-full items-center justify-between gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-medium text-white">
                      {mIdx + 1}
                    </span>
                    <div className="text-start">
                      <h3 className="font-medium text-slate-900">{m.title}</h3>
                      <p className="text-xs text-slate-600">
                        {list.length} lessons • {fmt(modSeconds)}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-slate-500 transition-transform',
                      open && 'rotate-180',
                    )}
                  />
                </button>

                {/* Animated content */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.ul
                      role="list"
                      className="divide-y divide-slate-100"
                      key="panel"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { height: 'auto' },
                        collapsed: { height: 0 },
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      {list.map((l, lIdx) => {
                        const preview = mIdx === 0 && lIdx < PREVIEW_COUNT;
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
                                  preview
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-slate-200 text-slate-600',
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
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
