'use client';

import { CheckCircle } from 'lucide-react';
import type { Course } from '@/lib/shared/types/courses';
import { Section } from '@/components/ui/section';

interface WhatYoullLearnProps {
  course: Course;
}

export function WhatYoullLearn({ course }: WhatYoullLearnProps) {
  // Temporary static list until backend stores real outcomes
  const learnings = course.learningOutcomes ?? [
    'Modern development patterns and best practices',
    'Testing strategies and debugging techniques',
    'Performance optimisation and scalability',
    'Clean code principles and architecture',
    'API design and integration patterns',
  ];

  const poster = course.imageUrl ||
    'https://placehold.co/640x360/png?text=Course+Preview';

  return (
    <Section bg="slate" className="py-24" aria-labelledby="learn-heading">
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
        {/* Copy & list */}
        <div className="space-y-10">
          <header className="space-y-4 max-w-md">
            <h2
              id="learn-heading"
              className="text-3xl font-semibold tracking-tight text-slate-800"
            >
              What you&#39;ll learn
            </h2>
          </header>

          <ul
            role="list"
            className="grid gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5"
          >
            {learnings.map(item => (
              <li key={item} className="flex gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                <span className="text-sm leading-relaxed text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual */}
        <div className="mx-auto w-full lg:max-w-[480px] lg:sticky lg:top-32">
          <div className="relative aspect-video w-full overflow-hidden rounded-md ring-1 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt={`${course.title} preview`} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </Section>
  );
} 