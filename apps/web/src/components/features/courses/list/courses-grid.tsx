"use client";

import { useRouter } from "next/navigation";
import { PlusCircle, Loader2, BookOpen } from "lucide-react";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";

import type { Course } from "@/lib/shared/types/courses";
import type { CreateCourseData } from "@/lib/shared/types/courses";
import { ApiError } from "@/lib/client/api/dashboard";
import { useCourses, useCreateCourse } from "@/lib/client/hooks/use-courses";
import { CourseCard } from "@/components/features/courses/course-card";

// Helper to convert standard Error to ApiError if needed
function toApiError(error: Error | null): ApiError | null {
  if (!error) return null;
  // If it's already an ApiError, return it
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
    <div
      onClick={handleClick}
      className={`group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 transition-all hover:border-slate-300 hover:bg-slate-100 ${
        isPending ? "cursor-not-allowed opacity-50" : ""
      }`}
      role="button"
      aria-disabled={isPending}
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
    </div>
  );
}

/**
 * Main courses grid component that displays all courses with create functionality
 */
export function CoursesGrid({ initialData }: { initialData?: Course[] } = {}) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useCourses(initialData ? { initialData } : undefined);
  const createCourseMutation = useCreateCourse();
  const isCreatingCourse = createCourseMutation.isPending;

  const handleCreateCourse = async () => {
    if (isCreatingCourse) return;

    const randomName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      style: "capital",
      separator: " ",
    });

    const courseData: CreateCourseData = {
      title: `${randomName} Course`,
      description: "Click to edit course details",
      price: 0,
      status: "draft",
    };

    try {
      const result = await createCourseMutation.mutateAsync(courseData);
      if (result?.id) {
        router.push(`/courses/${result.id}/edit`);
      } else {
        console.error("Course created, but no ID was returned from the API.");
      }
    } catch (err) {
      console.error("Failed to create course:", err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[220px] bg-slate-100 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center border border-slate-200 rounded-md">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <BookOpen className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="mb-2 text-sm font-medium text-slate-900">Failed to load courses</h3>
        <p className="mb-4 text-xs text-slate-500">{toApiError(error)?.message || "Unknown error"}</p>
        <button 
          className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
          onClick={() => refetch?.()}
        >
          Try again
        </button>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center border border-slate-200 rounded-md">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
          <BookOpen className="h-5 w-5 text-slate-400" />
        </div>
        <h3 className="mb-2 text-sm font-medium text-slate-900">No courses have been created yet.</h3>
        <button 
          className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
          onClick={handleCreateCourse}
        >
          Create Your First Course
        </button>
      </div>
    );
  }

  // Render grid with data
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
      <CreateCourseCard onClick={handleCreateCourse} isPending={isCreatingCourse} />
    </div>
  );
}
