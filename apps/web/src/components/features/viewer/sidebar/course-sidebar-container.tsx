"use client";

import type { Course, Lesson } from '@/lib/shared/types/courses';
import { PanelLeftClose, PanelLeft, Book } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/new-button";
import ModuleList from "./module-list";
import EnrollmentStatus from "./enrollment-status";
import SidebarFooter from "./sidebar-footer";
import { useCourseContext } from "@/lib/client/context/course-context";
import { memo, useCallback } from "react";

// Props now only need course data as everything else comes from context
interface CourseSidebarProps {
  course: Course;
  completedLessons?: string[]; // IDs of completed lessons
  /** Optional enrollment handler (e.g. show auth modal on unauthenticated click) */
  onEnroll?: () => Promise<void>;
}

function CourseSidebar({
  course,
  completedLessons = [],
  onEnroll,
}: CourseSidebarProps) {
  // Get all state from context
  const {
    currentLessonId,
    isEnrolled,
    enrollmentStatus,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isAuthenticated
  } = useCourseContext();

  // Compute course progress locally
  const totalAvailableLessons = course.lessons?.filter((l: Lesson) => l.playbackId).length || 0;
  const courseProgress = totalAvailableLessons > 0
    ? Math.round((completedLessons.length / totalAvailableLessons) * 100)
    : 0;

  // Count available lessons
  const availableLessons =
    course.lessons?.filter((lesson: Lesson) => lesson.playbackId)?.length || 0;
  const totalLessons = course.lessons?.length || 0;

  // Determine if the sidebar should be locked (not enrolled or pending approval)
  const isLocked =
    !isEnrolled ||
    enrollmentStatus === "pending" ||
    enrollmentStatus === "rejected";

  // Should show subscription CTA - only show if NOT enrolled with active status
  const shouldShowSubscriptionCTA =
    !isEnrolled || enrollmentStatus !== "active";

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */

  // Wrap async enrollment handler so callers expecting void get what they need.
  const handleAuthRequired = useCallback(() => {
    if (onEnroll) {
      void onEnroll();
    }
  }, [onEnroll]);

  return (
    <div
      className={`h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "w-16" : "w-80"
      }`}
    >
      {/* Header section */}
      {renderHeader()}

      {/* Course title - hidden when collapsed */}
      {!isSidebarCollapsed && renderCourseInfo()}

      {/* Enrollment Status - hidden when collapsed */}
      {!isSidebarCollapsed && (
        <EnrollmentStatus
          coursePrice={course.price}
          courseProgress={courseProgress}
          onEnroll={onEnroll}
        />
      )}

      {/* Lesson list container - hiding scrollbar */}
      <div
        className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? "py-2" : "py-3"} scrollbar-hide`}
      >
        <ModuleList
          course={course}
          currentLessonId={currentLessonId}
          isCollapsed={isSidebarCollapsed}
          isLocked={isLocked}
          completedLessons={completedLessons}
          isAuthenticated={isAuthenticated}
          onAuthRequired={handleAuthRequired}
        />
      </div>

      {/* Footer with subscription CTA */}
      {!isSidebarCollapsed && shouldShowSubscriptionCTA && <SidebarFooter />}
    </div>
  );

  // Header with toggle button
  function renderHeader() {
    if (isSidebarCollapsed) {
      return (
        <div className="border-b border-slate-200">
          {/* Toggle button on top with better padding */}
          {toggleSidebarCollapsed && (
            <button
              onClick={toggleSidebarCollapsed}
              className="w-full text-slate-600 hover:text-emerald-600 transition-colors p-4 flex items-center justify-center hover:bg-slate-50"
              aria-label="Expand sidebar"
              aria-expanded="false"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}

          {/* Active course status - progress indicator */}
          {isEnrolled && enrollmentStatus === "active" && (
            <div className="p-3 border-t border-slate-200 flex flex-col items-center">
              <div className="relative w-8 h-8 mb-1">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100"></div>
                <svg
                  viewBox="0 0 36 36"
                  className="w-8 h-8 transform -rotate-90"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${(courseProgress / 100) * 100} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald-600">
                  {courseProgress}%
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Progress
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <Link href="/">
          <Button type="text" size="tiny">
            Course Overview
          </Button>
        </Link>

        {toggleSidebarCollapsed && (
          <button
            onClick={toggleSidebarCollapsed}
            className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
            aria-label="Collapse sidebar"
            aria-expanded="true"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Course info section
  function renderCourseInfo() {
    return (
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900 mb-1 line-clamp-2">
          {course.title}
        </h2>
        <div className="flex items-center text-xs text-slate-500">
          <Book className="h-3.5 w-3.5 mr-1.5" />
          <span>
            {availableLessons} of {totalLessons} lessons available
          </span>
        </div>
      </div>
    );
  }
}

// Memoize the component to prevent unnecessary re-renders
export default memo(CourseSidebar);
