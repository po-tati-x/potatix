import { notFound } from 'next/navigation';
import { LessonViewer } from '@/components/features/viewer/lesson-viewer/lesson-viewer';
import { courseService } from '@/lib/server/services/courses';
import type { Lesson } from "@/lib/shared/types/courses";

export default async function LessonViewerPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug: courseSlug, id: lessonId } = await params;

  // Fetch course (includes lessons)
  const course = await courseService.getCourseBySlug(courseSlug, true);
  if (!course || !course.lessons) {
    notFound();
  }

  // Flatten lessons following module/lesson order
  const modules = (course.modules ?? []) as unknown as Array<{ order: number; lessons: Lesson[] }>;

  const lessons: Lesson[] = modules
    .sort((a, b) => a.order - b.order)
    .flatMap((mod) => (mod.lessons ?? []).sort((l1, l2) => l1.order - l2.order));

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) {
    notFound();
  }

  const lesson: Lesson = lessons[currentIndex];
  if (!lesson.videoId) {
    // Demo restriction – lesson without video unavailable
    notFound();
  }

  const nextLesson: Lesson | null = currentIndex + 1 < lessons.length ? lessons[currentIndex + 1] : null;
  const prevLesson: Lesson | null = currentIndex - 1 >= 0 ? lessons[currentIndex - 1] : null;

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