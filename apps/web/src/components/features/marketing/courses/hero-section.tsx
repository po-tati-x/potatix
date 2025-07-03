'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/new-button';
import type { Course } from '@/lib/shared/types/courses';
import { Section } from '@/components/ui/section';

import { useEnrollment } from '@/lib/client/hooks/use-enrollment';

interface HeroSectionProps {
  course: Course;
  isLoggedIn: boolean;
  onEnroll: () => void;
  isEnrolling: boolean;
}

// ────────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────────
export function HeroSection({ course, isLoggedIn, onEnroll, isEnrolling }: HeroSectionProps) {
  // ─────────────── Video helpers
  const previewplaybackId = course.lessons?.find(l => l.playbackId)?.playbackId;
  const poster =
    course.imageUrl ||
    (previewplaybackId
      ? `https://image.mux.com/${previewplaybackId}/thumbnail.jpg?width=1280&height=720&fit_mode=smartcrop`
      : undefined);

  // ─────────────── Derived data
  const isPaid = Boolean(course.price && course.price > 0);

  // ─────────────── Enrollment state (optional)
  const { enrollmentStatus } = useEnrollment(course.slug ?? '');
  const isPending = enrollmentStatus === 'pending';

  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <Section bg="slate-100" className="py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* ─────────────── Textual content */}
        <div className="order-2 lg:order-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl">
            {course.title}
          </h1>

          {course.description && (
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {course.description}
            </p>
          )}

          {/* Intentional empty spacer after description */}
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <Button
              type="primary"
              size="medium"
              onClick={onEnroll}
              loading={isEnrolling}
              disabled={isEnrolling || isPending}
              iconRight={<ChevronRight className="h-4 w-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-amber-500/60"
            >
              {isEnrolling
                ? 'Enrolling...'
                : isPending
                  ? 'Pending Approval'
                  : !isLoggedIn
                    ? 'Sign in to continue'
                    : isPaid
                      ? 'Request Enrollment'
                      : 'Enroll Now (Free)'}
            </Button>

            <div className="flex items-baseline gap-2">
              {isPaid ? (
                <>
                  <span className="text-2xl font-semibold text-slate-900">${course.price}</span>
                </>
              ) : (
                <span className="text-2xl font-semibold text-emerald-600">Free Course</span>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────── Video preview */}
        <div className="order-1 lg:order-2">
          {previewplaybackId ? (
            <video
              src={`https://stream.mux.com/${previewplaybackId}.m3u8`}
              poster={poster}
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video w-full rounded-lg object-cover"
            />
          ) : (
            poster && (
              <Image src={poster} alt={course.title} fill className="object-cover" priority />
            )
          )}
        </div>
      </div>
    </Section>
  );
}
