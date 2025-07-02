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
          type="primary"
          size="medium"
          onClick={onEnroll}
          loading={isEnrolling}
          disabled={isEnrolling || isPending}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-amber-300 disabled:text-slate-900 disabled:opacity-100"
        >
          {isEnrolling ? (
            <>
              <span className="hidden sm:inline">Enrolling...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : isPending ? (
            <>
              <span className="hidden sm:inline">Pending Approval</span>
              <span className="sm:hidden">Pending</span>
            </>
          ) : !isLoggedIn ? (
            <>
              <span className="hidden sm:inline">Sign in to continue</span>
              <span className="sm:hidden">Sign in</span>
            </>
          ) : course.price && course.price > 0 ? (
            <>
              <span className="hidden sm:inline">Request Enrollment</span>
              <span className="sm:hidden">Request</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Enroll Now (Free)</span>
              <span className="sm:hidden">Enroll</span>
            </>
          )}
        </Button>
      </div>

      {/* Accent line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
    </div>
  );
}
