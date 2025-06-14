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

  const lessons = course.lessons as unknown as Lesson[];
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

  return (
    <LessonViewer
      lesson={lesson}
      currentIndex={currentIndex}
      totalLessons={lessons.length}
      nextLesson={nextLesson}
      courseSlug={courseSlug}
    />
  );
} 