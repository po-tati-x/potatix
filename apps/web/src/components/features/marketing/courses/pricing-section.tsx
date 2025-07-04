"use client";

import {
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Globe,
  Bot,
  Zap,
  CloudLightning,
  Tv2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { Section } from "@/components/ui/section";
import type { Course } from "@/lib/shared/types/courses";
import { cn } from "@/lib/shared/utils/cn";
import { InfiniteZig } from "@/components/ui/infinite-zig";
import { useEnrollment } from "@/lib/client/hooks/use-enrollment";

interface PricingSectionProps {
  course: Course;
  isLoggedIn: boolean;
  onEnroll: () => void;
  isEnrolling: boolean;
}

export function PricingSection({ course, isLoggedIn, onEnroll, isEnrolling }: PricingSectionProps) {
  const isFree = (course.price ?? 0) <= 0;
  const priceLabel = isFree ? "Free" : `$${course.price?.toLocaleString()}`;

  // Enrollment pending status
  const { enrollmentStatus } = useEnrollment(course.slug ?? "");
  const isPending = enrollmentStatus === "pending";
  const isActive = enrollmentStatus === "active";
  const isRejected = enrollmentStatus === "rejected";

  // Feature bullets – authored by course owner; fallback seed list when nothing configured yet
  const perks = course.perks && course.perks.filter(Boolean).length
    ? course.perks
    : [
        "52 hours on-demand video",
        "23 coding exercises",
        "Assignments",
        "225 articles",
        "164 downloadable resources",
        "Access on mobile & TV",
        "Certificate of completion",
      ];

  // Platform-wide perks – universal across all courses
  const platformChips: Array<{ icon: LucideIcon; label: string }> = [
    { icon: Sparkles, label: "AI-powered hints" },
    { icon: Globe, label: "Multilingual captions" },
    { icon: Bot, label: "Chat assistant" },
    { icon: Zap, label: "Blazing-fast player" },
    { icon: CloudLightning, label: "Cloud-synced progress" },
    { icon: Tv2, label: "Chromecast & AirPlay" },
  ];

  return (
    <Section
      bg="white"
      className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 lg:min-h-[80vh]"
      aria-labelledby="pricing-heading"
    >
      {/* Decorative sparkles top-right */}
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute right-4 top-24 h-8 w-8 text-emerald-300 sm:right-8 sm:top-24 z-10"
      />

      {/* Infinite zigzag decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-x-hidden overflow-y-visible">
        <InfiniteZig position="top" />
        <InfiniteZig position="bottom" />
      </div>

      <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-20">
        {/* Checkout Card – sticky on large screens */}
        <div className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-32">
          <div className="rounded-xl border border-slate-200 bg-white/70 p-8 shadow-sm shadow-slate-100 backdrop-blur-md">
            <header className="mb-8 space-y-2 text-center">
              <p className={cn("text-4xl font-bold", isFree ? "text-emerald-600" : "text-slate-900")}>{priceLabel}</p>
              <p className="text-sm text-slate-500">
                {isFree ? "No credit card required" : "One-time payment • Lifetime updates"}
              </p>
            </header>

            <Button
              type={isRejected ? 'danger' : 'primary'}
              size="large"
              block
              onClick={onEnroll}
              loading={isEnrolling}
              disabled={isEnrolling || isPending || isRejected}
            >
              {isEnrolling
                ? "Enrolling..."
                : isPending
                  ? "Pending Approval"
                  : isRejected
                    ? "Enrollment Rejected"
                    : isActive
                      ? "Continue Learning"
                      : !isLoggedIn
                        ? "Sign In To Enroll"
                        : isFree
                          ? "Start Learning"
                          : "Enroll Now"}
            </Button>

            {/* Satisfaction guarantee */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 30-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Sales copy & perks */}
        <article className="space-y-10">
          <header className="space-y-4">
            <h2
              id="pricing-heading"
              className="text-3xl font-semibold tracking-tight text-slate-800"
            >
              What&#39;s inside
            </h2>
          </header>

          <ul
            role="list"
            className="grid gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5"
          >
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                {perk}
              </li>
            ))}
          </ul>

          {/* Platform feature chips */}
          <ul role="list" className="flex flex-wrap gap-3 pt-2 text-xs text-slate-500">
            {platformChips.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </Section>
  );
}