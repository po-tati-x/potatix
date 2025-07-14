"use client";

import React from "react";
import { Loader2, PlusCircle, AlertTriangle } from "lucide-react";
import type { Course } from "@/lib/shared/types/courses";
import { ApiError } from "@/lib/client/api/dashboard";
import { useCourses } from "@/lib/client/hooks/use-courses";
import { CourseCard } from "@/components/features/courses/course-card";

// Helper to convert standard Error to ApiError if needed
function toApiError(error?: Error): ApiError | undefined {
  if (!error) return undefined;
  // If it's already an ApiError, return error directly
  if ('status' in error) return error as ApiError;
  // Otherwise, create a new ApiError with a default status
  return new ApiError(error.message, 500);
}

/**
 * A card for initiating the creation of a new course.
 * It displays a loading state and disables interactions while pending.
 */
function CreateCourseCard({
  onClick,
  isPending,
}: {
  onClick: () => void;
  isPending: boolean;
}) {
  const handleClick = () => {
    if (!isPending) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`group flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 transition-all hover:border-slate-300 hover:bg-slate-100 ${
        isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 transition-transform group-hover:scale-110">
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <PlusCircle className="h-5 w-5 text-white" />
          )}
        </div>
        <h3 className="mb-1 text-sm font-medium text-slate-900">
          {isPending ? "Creating course..." : "Create a new course"}
        </h3>
        <p className="text-xs text-slate-500">
          {isPending ? "Please wait" : "Add another course to your catalog"}
        </p>
      </div>
    </button>
  );
}

interface CoursesGridProps {
  initialData?: Course[];
  onCreateCourse: () => void;
  isCreatingCourse: boolean;
}

export function CoursesGrid({
  initialData,
  onCreateCourse,
  isCreatingCourse,
}: CoursesGridProps) {
  const { data, isLoading, error, refetch } = useCourses(
    initialData ? { initialData } : undefined,
  );

  // Skeleton placeholder while loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCourseCard key={i} />
        ))}
      </div>
    );
  }

  // Reusable state card component for empty & error views
  function StateCard({
    icon,
    title,
    message,
    actionLabel,
    onAction,
  }: {
    icon: React.ReactNode;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
  }) {
    return (
      <div className="p-6 text-center border border-slate-200 rounded-md bg-white">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
          {icon}
        </div>
        <h3 className="mb-2 text-sm font-medium text-slate-900">{title}</h3>
        {message && <p className="mb-4 text-xs text-slate-500">{message}</p>}
        {actionLabel && onAction && (
          <button
            type="button"
            className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
            onClick={() => {
              void onAction();
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <StateCard
        icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
        title="Failed to load courses"
        message={toApiError(error)?.message ?? "Unknown error"}
        actionLabel="Try again"
        onAction={() => {
          void refetch?.();
        }}
      />
    );
  }

  const hasCourses = data && data.length > 0;

  // Render grid with data
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {hasCourses &&
        data.map((course) => <CourseCard key={course.id} course={course} />)}
      <CreateCourseCard onClick={onCreateCourse} isPending={isCreatingCourse} />
    </div>
  );
}

/**
 * Minimal course card skeleton to maintain layout consistency
 */
function SkeletonCourseCard() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white animate-pulse">
      <div className="h-44 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-slate-100 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-2/3 bg-slate-100 rounded" />
      </div>
    </div>
  );
}
