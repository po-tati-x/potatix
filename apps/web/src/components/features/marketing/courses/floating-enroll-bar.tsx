'use client';

import { cn } from '@/lib/shared/utils/cn';
import { Button } from '@/components/ui/new-button';
import type { Course } from '@/lib/shared/types/courses';
import { useEnrollment } from '@/lib/client/hooks/use-enrollment';

interface FloatingEnrollBarProps {
  course: Course;
  isVisible: boolean;
  isLoggedIn: boolean;
  onEnroll: () => void;
  isEnrolling: boolean;
}

/*
 * FloatingEnrollBar – lightweight, shadow-free sticky enrollment CTA.
 * Slides in when `isVisible` is true (handled by parent via IntersectionObserver)
 * • Mobile: sticks to bottom
 * • Desktop: sticks to top (under nav)
 */
export function FloatingEnrollBar({
  course,
  isVisible,
  isLoggedIn,
  onEnroll,
  isEnrolling,
}: FloatingEnrollBarProps) {
  const totalLessons = course.lessons?.length ?? 0;
  const totalModules = course.modules?.length ?? 0;

  const priceLabel = course.price && course.price > 0 ? `$${course.price}` : 'Free';

  // Enrollment state
  const { enrollmentStatus } = useEnrollment(course.slug ?? '');
  const isPending = enrollmentStatus === 'pending';
  const isActive = enrollmentStatus === 'active';
  const isRejected = enrollmentStatus === 'rejected';

  /* ------------------------------------------------------------------ */
  /*  CTA label logic – avoid nested ternaries for clarity              */
  /* ------------------------------------------------------------------ */

  const isPaidCourse = Boolean(course.price && course.price > 0);

  let fullLabel: string;
  let shortLabel: string;

  if (isEnrolling) {
    fullLabel = 'Enrolling...';
    shortLabel = '...';
  } else if (isPending) {
    fullLabel = 'Pending Approval';
    shortLabel = 'Pending';
  } else if (isActive) {
    fullLabel = 'Continue Learning';
    shortLabel = 'Continue';
  } else if (isRejected) {
    fullLabel = 'Enrollment Rejected';
    shortLabel = 'Rejected';
  } else if (isLoggedIn) {
    if (isPaidCourse) {
      fullLabel = 'Request Enrollment';
      shortLabel = 'Request';
    } else {
      fullLabel = 'Enroll Now (Free)';
      shortLabel = 'Enroll';
    }
  } else {
    fullLabel = 'Sign in to continue';
    shortLabel = 'Sign in';
  }

  return (
    <div
      className={cn(
        // positioning
        'fixed inset-x-0 z-40 lg:top-0 lg:bottom-auto bottom-0',
        // slide animation
        'transform-gpu transition-transform duration-300 ease-out',
        isVisible ? 'translate-y-0 lg:translate-y-0' : 'translate-y-full lg:-translate-y-full',
        // visual
        'border-t lg:border-b border-slate-200 bg-white/95 backdrop-blur-md',
      )}
    >
      {/* inner container */}
      <div className="container mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 text-slate-800">
        {/* Course meta */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{course.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span>{totalLessons} lessons</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
            <span className="hidden sm:inline">{totalModules} modules</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          {course.price && course.price > 0 ? (
            <span className="text-base font-semibold text-slate-900">{priceLabel}</span>
          ) : (
            <span className="text-base font-semibold text-emerald-600">{priceLabel.toUpperCase()}</span>
          )}
        </div>

        {/* CTA */}
        <Button
          type={isRejected ? 'danger' : 'primary'}
          size="medium"
          onClick={onEnroll}
          loading={isEnrolling}
          disabled={isEnrolling || isPending || isRejected}
        >
          <span className="hidden sm:inline">{fullLabel}</span>
          <span className="sm:hidden">{shortLabel}</span>
        </Button>
      </div>

      {/* Accent line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
    </div>
  );
}
