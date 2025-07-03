import { notFound, redirect } from 'next/navigation';
import { ensureCourseSubdomain, getViewerAccess } from '@/lib/server/utils/course-viewer';
import { LessonViewer } from '@/components/features/viewer/lesson-viewer/lesson-viewer';
import type { Lesson } from "@/lib/shared/types/courses";

export default async function LessonViewerPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug: courseSlug, id: lessonId } = await params;

  // Ensure correct subdomain
  await ensureCourseSubdomain(courseSlug);

  // Fetch course + auth/enrollment in one go
  const { course, isEnrolled } = await getViewerAccess(courseSlug);
  if (!course || !course.lessons) {
    notFound();
  }

  // Flatten lessons following module/lesson order
  const modules = (course.modules ?? []) as unknown as Array<{ order: number; lessons: Lesson[] }>;

  const flattenedLessons: Lesson[] = modules
    .sort((a, b) => a.order - b.order)
    .flatMap((mod) => (mod.lessons ?? []).sort((l1, l2) => l1.order - l2.order));

  // Exclude lessons that do not have a video
  const lessons: Lesson[] = flattenedLessons.filter((l) => l.playbackId);

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) {
    notFound();
  }

  // Server-side gate – unauthenticated / unenrolled users can only access public preview lessons
  const currentLesson = lessons[currentIndex]!;
  const isPublicPreview = currentLesson.visibility === 'public';

  if (!isEnrolled && !isPublicPreview) {
    // Bounce before any HTML for the lesson is streamed
    redirect('/');
  }

  const lesson: Lesson = currentLesson;

  const nextLesson: Lesson | null = currentIndex + 1 < lessons.length ? lessons[currentIndex + 1]! : null;
  const prevLesson: Lesson | null = currentIndex - 1 >= 0 ? lessons[currentIndex - 1]! : null;

  return (
    <LessonViewer
      lesson={lesson}
      currentIndex={currentIndex}
      totalLessons={lessons.length}
      nextLesson={nextLesson}
      prevLesson={prevLesson}
      courseSlug={courseSlug}
    />
  );
} 