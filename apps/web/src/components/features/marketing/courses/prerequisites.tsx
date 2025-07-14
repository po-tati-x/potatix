'use client';

import type { Course } from '@/lib/shared/types/courses';
import { Section } from '@/components/ui/section';

interface PrerequisitesProps {
  course: Course;
}

export function Prerequisites({ course }: PrerequisitesProps) {
  // Fallback to sensible defaults when course.prerequisites absent
  const prereqs = course.prerequisites ?? [
    'Solid understanding of JavaScript / TypeScript fundamentals',
    'Comfort with modern ES modules and async / await',
    'Basic familiarity with Git and the command-line',
  ];

  return (
    <Section
      bg="slate-100"
      className="py-24"
      aria-labelledby="prereq-heading"
    >
      <div className="space-y-10 max-w-3xl mx-auto">
        <header className="space-y-4">
          <h2
            id="prereq-heading"
            className="text-3xl font-semibold tracking-tight text-slate-800"
          >
            Prerequisites
          </h2>
        </header>

        <ul
          className="grid gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5"
        >
          {prereqs.map(item => (
            <li key={item} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
              <span className="text-sm leading-relaxed text-slate-600">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
} 