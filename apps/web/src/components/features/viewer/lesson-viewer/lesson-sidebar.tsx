"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/lib/shared/types/courses";
import { getLessonPath } from "@/lib/shared/utils/navigation";

interface LessonSidebarProps {
  currentIndex: number;
  totalLessons: number;
  progress: number;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
  courseSlug: string;
}

export const LessonSidebar = memo(
  ({
    currentIndex,
    totalLessons,
    progress,
    nextLesson,
    prevLesson,
    courseSlug,
  }: LessonSidebarProps) => {
    const router = useRouter();
    const hasNext = !!nextLesson;
    const hasPrev = !!prevLesson;

    const handlePrev = () => {
      if (!hasPrev || !prevLesson) return;

      router.push(getLessonPath(courseSlug, prevLesson.id));
    };

    const handleNext = () => {
      if (!hasNext || !nextLesson) return;

      router.push(getLessonPath(courseSlug, nextLesson.id));
    };

    return (
      <div className="flex justify-between items-center mb-5">
        <Button
          type="text"
          size="small"
          icon={<ChevronLeft className="h-3.5 w-3.5" />}
          onClick={handlePrev}
          disabled={!hasPrev}
          className="text-slate-700"
        >
          <span className="hidden sm:inline">Previous lesson</span>
          <span className="sm:hidden">Previous</span>
        </Button>

        <div className="text-sm text-slate-600 flex items-center gap-2">
          <span className="font-medium text-emerald-700">
            {currentIndex + 1} of {totalLessons}
          </span>
          <span className="text-slate-400">•</span>
          <span>{Math.round(progress)}% complete</span>
        </div>

        <Button
          type="text"
          size="small"
          iconRight={<ChevronRight className="h-3.5 w-3.5" />}
          onClick={handleNext}
          disabled={!hasNext}
          className="text-slate-700"
        >
          <span className="hidden sm:inline">Next lesson</span>
          <span className="sm:hidden">Next</span>
        </Button>
      </div>
    );
  },
);

LessonSidebar.displayName = "LessonSidebar";
