'use client';

import Image from 'next/image';
import { Layers, Hammer, Users, type LucideIcon } from 'lucide-react';
import type { Course } from '@/lib/shared/types/courses';
import { Section } from '@/components/ui/section';

interface HighlightItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface CourseHighlightsProps {
  course: Course;
}

export function CourseHighlights({ course }: CourseHighlightsProps) {
  const moduleCount = course.modules?.length ?? 0;
  const lessonCount = course.lessons?.length ?? 0;

  const highlights: HighlightItem[] = [
    {
      icon: Layers,
      title: `${moduleCount} concise modules`,
      description: 'Structured path — no filler, no detours.',
    },
    {
      icon: Hammer,
      title: 'Project-based learning',
      description: `Build real features across ${lessonCount} hands-on lessons.`,
    },
    {
      icon: Users,
      title: 'Direct mentor support',
      description: 'Get unstuck fast via private community & instructor Q&A.',
    },
  ];

  const courseImage =
    course.imageUrl || 'https://placehold.co/640x360/png?text=Course+Preview';

  return (
    <Section bg="white" className="py-24" aria-labelledby="highlights-heading">
      <div className="grid gap-12 items-start lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
        {/* Copy & bullets */}
        <div className="space-y-8">
          <header className="space-y-4">
            <h2
              id="highlights-heading"
              className="text-3xl font-semibold tracking-tight text-slate-800"
            >
              Why students finish{' '}
              <span className="text-emerald-600">this</span> course
            </h2>
            <p className="text-base leading-relaxed text-slate-600 max-w-md">
              Cut the fluff; keep the wins.
            </p>
          </header>

          <ul className="space-y-6">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600"
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-800">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Image */}
        <div className="mx-auto w-full lg:max-w-[480px] lg:sticky lg:top-32">
          <div className="relative aspect-video w-full rounded-md ring-1 ring-slate-200 overflow-hidden">
            <Image
              src={courseImage}
              alt={`${course.title} preview`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
