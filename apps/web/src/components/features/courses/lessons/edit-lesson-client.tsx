"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { CourseHeader } from "@/components/features/courses/course-header";
import { CourseErrorAlert } from "@/components/features/courses/course-error-alert";
import dynamic from "next/dynamic";

// Heavy components lazy-loaded client side
const VideoUploader = dynamic(
  () => import("@/components/features/courses/media/video-uploader").then((m) => m.VideoUploader),
  { ssr: false, loading: () => <div className="h-32 rounded-md border border-slate-200 flex items-center justify-center text-xs text-slate-500">Loading uploader…</div> },
);

const VideoPreview = dynamic(
  () => import("@/components/features/courses/media/video-preview").then((m) => m.VideoPreview),
  { ssr: false },
);
const LessonChaptersEditor = dynamic(
  () => import("@/components/features/courses/lessons/lesson-chapters-editor").then((m) => m.LessonChaptersEditor),
  { ssr: false },
);

const LessonPromptsEditor = dynamic(
  () => import("@/components/features/courses/lessons/lesson-prompts-editor").then((m) => m.LessonPromptsEditor),
  { ssr: false },
);
import { Button } from "@/components/ui/new-button";
import {
  useCourse,
  useUpdateLesson,
  useDeleteLesson,
} from "@/lib/client/hooks/use-courses";
import { useQueryClient } from "@tanstack/react-query";
import { courseKeys } from "@/lib/shared/constants/query-keys";
import { LESSON_UPLOAD_STATUS } from "@/lib/config/upload";
import { LessonDetailsEditor } from "@/components/features/courses/lessons/lesson-details-editor";
import type { Course } from "@/lib/shared/types/courses";

interface Props {
  courseId: string;
  lessonId: string;
  initialCourse?: Course;
}

/**
 * Stand-alone lesson editing screen reusing existing LessonEditor UI.
 */
export default function EditLessonClient({ courseId, lessonId, initialCourse }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  /* ------------------------------------------------------------------ */
  /*  Data fetching                                                     */
  /* ------------------------------------------------------------------ */
  const {
    data: course,
    isLoading,
    error: fetchError,
  } = useCourse(courseId, { initialData: initialCourse });

  const rawLesson = course?.lessons?.find((l) => l.id === lessonId);

  /* ------------------------------------------------------------------ */
  /*  Local state – only error now                                       */
  /* ------------------------------------------------------------------ */
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Mutations                                                         */
  /* ------------------------------------------------------------------ */
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const isDeletingLesson = deleteLessonMutation.isPending;

  /* ------------------------------------------------------------------ */
  /*  Video handlers                                                    */
  /* ------------------------------------------------------------------ */
  const handleFileRemove = () => {
    updateLessonMutation.mutate({
      lessonId,
      playbackId: null,
      uploadStatus: null,
      courseId,
    });
  };

  const handleDirectUploadComplete = () => {
    // Persist PROCESSING state so reload shows correct status
    updateLessonMutation.mutate({ lessonId, uploadStatus: "processing", courseId });
    queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  };

  const handleProcessingComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  }, [courseId, queryClient]);

  /* ------------------------------------------------------------------ */
  /*  Derived lesson for preview                                        */
  /* ------------------------------------------------------------------ */
  const lessonForPreview = rawLesson
    ? {
        ...rawLesson,
        fileUrl: rawLesson.playbackId
          ? `https://image.mux.com/${rawLesson.playbackId}/thumbnail.jpg`
          : undefined,
      }
    : null;

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  if (isLoading && !initialCourse) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Loading lesson…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <CourseErrorAlert error={fetchError instanceof Error ? fetchError.message : "Failed to load data"} />
      </div>
    );
  }

  if (!course || !rawLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Lesson not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header with right-aligned delete button */}
      <CourseHeader
        courseId={courseId}
        courseTitle={course.title}
        backHref={course.slug ? `/courses/${course.slug}/edit` : "/courses"}
        title="Edit Lesson"
        action={
          <Button
            type="danger"
            size="small"
            iconLeft={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => {
              if (isDeletingLesson) return;
              if (!window.confirm("Delete this lesson permanently?")) return;
              deleteLessonMutation.mutate(
                { lessonId, courseId },
                {
                  onSuccess: () => {
                    const back = course?.slug ? `/courses/${course.slug}/edit` : "/courses";
                    router.push(back);
                  },
                  onError: (err) => setError(err instanceof Error ? err.message : "Failed to delete lesson"),
                },
              );
            }}
            loading={isDeletingLesson}
            aria-busy={isDeletingLesson}
            disabled={isDeletingLesson}
          >
            Delete Lesson
          </Button>
        }
      />

      {/* Form error */}
      {error && <CourseErrorAlert error={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="md:col-span-2 space-y-5">
          {/* Lesson details */}
          <LessonDetailsEditor courseId={courseId} lesson={rawLesson} />

          {/* Chapters Editor */}
          <LessonChaptersEditor courseId={courseId} lesson={rawLesson} />
          <LessonPromptsEditor courseId={courseId} lesson={rawLesson} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {!rawLesson.playbackId ? (
            <VideoUploader
              lessonId={lessonId}
              onDirectUploadComplete={handleDirectUploadComplete}
              onProcessingComplete={handleProcessingComplete}
              initialStatus={(() => {
                const raw = (rawLesson.uploadStatus ?? "").toUpperCase();
                if (raw === "UPLOADING") return LESSON_UPLOAD_STATUS.UPLOADING;
                if (raw === "PROCESSING") return LESSON_UPLOAD_STATUS.PROCESSING;
                if (raw === "PENDING") return LESSON_UPLOAD_STATUS.UPLOADING;
                return LESSON_UPLOAD_STATUS.IDLE;
              })()}
            />
          ) : (
            <VideoPreview lesson={lessonForPreview as any} onFileRemove={handleFileRemove} />
          )}
        </div>
      </div>
    </div>
  );
} 