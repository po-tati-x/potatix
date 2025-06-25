"use client";

import {
  BookOpen,
  ChevronRight,
  DollarSign,
  LineChart,
  Play,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/new-button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/shared/types/courses";
import { formatPrice, formatNumber } from "@/lib/shared/utils/format";
import { useCourses } from "@/lib/client/providers/dashboard-context";

/**
 * Dashboard panel that displays up to 3 courses with stats and actions
 */
export function CoursesPanel() {
  const router = useRouter();
  const { courses, isLoading, error, refreshDashboard } = useCourses();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <h2 className="text-sm font-medium text-slate-900">Your Courses</h2>
        </div>
        <div className="animate-pulse space-y-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-md" />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <h2 className="text-sm font-medium text-slate-900">Your Courses</h2>
        </div>
        <div className="p-6 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <BookOpen className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="mb-2 text-sm font-medium text-slate-900">Failed to load courses</h3>
          <p className="mb-4 text-xs text-slate-500">{error.message}</p>
          <Button type="outline" size="small" onClick={refreshDashboard}>Try again</Button>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!courses || courses.length === 0) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <h2 className="text-sm font-medium text-slate-900">Your Courses</h2>
        </div>
        <div className="p-6 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <BookOpen className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="mb-2 text-sm font-medium text-slate-900">No courses yet</h3>
          <Button 
            type="outline" 
            size="small" 
            onClick={() => router.push("/courses/create")}
          >
            Create a Course
          </Button>
        </div>
      </div>
    );
  }
  
  // Show only up to 3 courses in the dashboard
  const displayCourses = courses.slice(0, 3);

  // Navigation handlers
  const handleViewAllClick = () => {
    router.push("/courses");
  };

  const handleCourseClick = (slug: string) => {
    router.push(`/courses/${slug}`);
  };

  const handleStatsClick = (slug: string) => {
    router.push(`/courses/${slug}/stats`);
  };

  const handleContinueClick = (slug: string) => {
    router.push(`/courses/${slug}/edit`);
  };

  // Data available - render courses
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-900">Your Courses</h2>
          <Button
            type="text"
            size="tiny"
            onClick={handleViewAllClick}
            iconRight={<ChevronRight className="h-3.5 w-3.5" />}
          >
            View all
          </Button>
        </div>
      </div>

      {/* Courses list */}
      <div className="divide-y divide-slate-100">
        {displayCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onCourseClick={() => handleCourseClick(course.slug!)}
            onStatsClick={() => handleStatsClick(course.slug!)}
            onContinueClick={() => handleContinueClick(course.slug!)}
          />
        ))}
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  onCourseClick: () => void;
  onStatsClick: () => void;
  onContinueClick: () => void;
}

function CourseCard({
  course,
  onCourseClick,
  onStatsClick,
  onContinueClick,
}: CourseCardProps) {
  // Adapt API data structure to the UI needs
  const courseData = {
    id: course.id,
    title: course.title,
    image: course.imageUrl || "",
    status: course.status,
    students: course.studentCount || 0,
    revenue: course.price || 0,
  };

  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-16 h-10 bg-slate-100 rounded overflow-hidden">
          {courseData.image ? (
            <Image
              src={courseData.image}
              alt={courseData.title}
              width={64}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-slate-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-900 truncate">
              {courseData.title}
            </h3>
            <span
              className={`inline-flex text-xs px-2 py-0.5 rounded-full capitalize ${
                courseData.status === "published"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {courseData.status}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-600">
                  {formatNumber(courseData.students)}
                </span>
              </div>

              {courseData.status === "published" && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">
                    {formatPrice(courseData.revenue)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {courseData.status === "published" ? (
                <Button
                  type="outline"
                  size="tiny"
                  icon={<LineChart className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatsClick();
                  }}
                >
                  Stats
                </Button>
              ) : (
                <Button
                  type="outline"
                  size="tiny"
                  icon={<Play className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinueClick();
                  }}
                >
                  Continue
                </Button>
              )}

              <Button
                type="text"
                size="tiny"
                icon={<ChevronRight className="h-3.5 w-3.5" />}
                onClick={onCourseClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
