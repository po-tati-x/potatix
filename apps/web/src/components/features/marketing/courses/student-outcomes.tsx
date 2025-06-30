'use client';

import type { LucideIcon } from 'lucide-react';
import { CheckCircle, Target, Rocket } from 'lucide-react';
import type { Course } from '@/lib/shared/types/courses';
import { Section } from '@/components/ui/section';

interface StudentOutcomesProps {
  course: Course;
}

export function StudentOutcomes({ course }: StudentOutcomesProps) {
  const outcomes: Array<{ icon: LucideIcon; title: string; description: string }> = [
    {
      icon: Target,
      title: 'Master Core Concepts',
      description:
        'Build a foundation that translates directly to production-grade projects.',
    },
    {
      icon: Rocket,
      title: 'Ship Production Code',
      description: 'Adopt patterns pros use to deliver reliable, maintainable features.',
    },
  ];

  const skillCategories = [
    {
      title: 'Technical Expertise',
      skills: [
        'Modern development patterns and best practices',
        'Testing strategies and debugging techniques',
        'Performance optimization and scalability',
        'Clean code principles and architecture',
        'API design and integration patterns',
        'Security fundamentals and implementation',
      ],
    },
    {
      title: 'Professional Skills',
      skills: [
        'Project planning and requirement analysis',
        'Technical communication and documentation',
        'Code review and collaboration workflows',
        'Problem-solving and analytical thinking',
        'Time management and priority setting',
        'Continuous learning and adaptation',
      ],
    },
  ];

  return (
    <Section bg="slate" className="py-24" data-course-id={course.id}>
      <div className="space-y-20">
        {/* Top – Heading + outcome list */}
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <header className="space-y-6 lg:pr-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-800">
              Outcomes That
              <br className="hidden sm:inline" /> Move The Needle in {course.title}
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Each lesson is laser-focused on tangible, production-ready skills you can deploy on the
              job tomorrow.
            </p>

            <ul role="list" className="space-y-5 pt-2">
              {outcomes.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-medium text-slate-800">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </header>

          {/* Skills Grid */}
          <div className="space-y-10">
            {skillCategories.map(({ title, skills }, idx) => (
              <details
                key={title}
                {...(idx === 0 ? { open: true } : {})}
                className="group overflow-hidden rounded-md border border-slate-200 bg-white"
              >
                <summary
                  className="flex cursor-pointer items-center justify-between gap-2 p-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 [&_::-webkit-details-marker]:hidden"
                >
                  <span>{title}</span>
                  {/* simple chevron */}
                  <svg
                    className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>

                <ul role="list" className="space-y-3 px-6 pb-4 pt-2">
                  {skills.map(skill => (
                    <li key={skill} className="flex gap-2">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm leading-relaxed text-slate-600">{skill}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
