"use client";

import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import type { Course } from "@/lib/shared/types/courses";

import { Button } from "@/components/ui/new-button";
import { CoursesGrid } from "./courses-grid";
import { useCreateCourse } from "@/lib/client/hooks/use-courses";
import type { CreateCourseData } from "@/lib/shared/types/courses";

/**
 * Client component that renders the main courses page layout.
 * It includes the page header with a "New Course" button and the main grid of courses.
 * State and actions are managed via context hooks, assuming providers are in the parent.
 */
export default function CoursesPageClient({ initialData }: { initialData?: Course[] } = {}) {
  const router = useRouter();
  const createCourseMutation = useCreateCourse();
  const isCreatingCourse = createCourseMutation.isPending;

  // ───────────────────────────────────────────────────────────────────────────
  // Course creation logic (async)
  // ───────────────────────────────────────────────────────────────────────────

  const handleCreateCourse = async () => {
    if (isCreatingCourse) return;

    const randomName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      style: "capital",
      separator: " ",
    });

    const courseData: CreateCourseData = {
      title: `${randomName} Course`,
      description: "",
      price: 0,
      status: "draft",
    };

    try {
      const created = await createCourseMutation.mutateAsync(courseData);
      if (created?.slug) {
        router.push(`/courses/${created.slug}/edit`);
      } else {
        console.error("Course created, but no slug returned from API");
      }
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  // Sync wrapper to appease eslint – avoids passing a Promise-returning fn to
  // React event props while still letting us `await` inside.
  const handleCreateCourseClick = () => {
    void handleCreateCourse();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-medium text-slate-900">My Courses</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Create and manage your course content. Each course can contain
              multiple lessons with videos.
            </p>
          </div>

          <Button
            type="primary"
            size="small"
            iconLeft={<PlusCircle className="h-3.5 w-3.5" />}
            onClick={handleCreateCourseClick}
            loading={isCreatingCourse}
            aria-busy={isCreatingCourse}
          >
            New Course
          </Button>
        </div>
      </header>

      <main>
        <CoursesGrid
          initialData={initialData}
          onCreateCourse={handleCreateCourseClick}
          isCreatingCourse={isCreatingCourse}
        />
      </main>
    </div>
  );
}
