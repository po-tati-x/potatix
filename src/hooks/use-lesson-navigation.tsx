import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/lib/types/api';
import { useViewerStore } from '@/lib/stores/viewer';

interface UseLessonNavigationOptions {
  currentLessonId?: string;
  courseSlug?: string;
  autoMarkCompleteOnNext?: boolean;
}

interface UseLessonNavigationReturn {
  currentLessonIndex: number;
  totalLessons: number;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
  hasNext: boolean;
  hasPrev: boolean;
  goToNextLesson: () => void;
  goToPrevLesson: () => void;
  goToLesson: (lessonId: string) => void;
  goToCourseOverview: () => void;
}

/**
 * Hook to handle lesson navigation logic
 */
export function useLessonNavigation({
  currentLessonId,
  courseSlug,
  autoMarkCompleteOnNext = true
}: UseLessonNavigationOptions = {}): UseLessonNavigationReturn {
  const router = useRouter();
  const { currentCourse, markLessonCompleted } = useViewerStore();
  
  // Find current lesson index
  const currentLessonIndex = useMemo(() => {
    if (!currentLessonId || !currentCourse?.lessons) return -1;
    return currentCourse.lessons.findIndex(l => l.id === currentLessonId);
  }, [currentLessonId, currentCourse?.lessons]);
  
  // Total number of lessons
  const totalLessons = currentCourse?.lessons?.length || 0;
  
  // Determine if we have available previous and next lessons
  const availableLessons = useMemo(() => {
    if (!currentCourse?.lessons) return [];
    return currentCourse.lessons.filter(lesson => lesson.videoId);
  }, [currentCourse?.lessons]);
  
  // Find current available lesson index
  const currentAvailableIndex = useMemo(() => {
    if (!currentLessonId || !availableLessons.length) return -1;
    return availableLessons.findIndex(l => l.id === currentLessonId);
  }, [currentLessonId, availableLessons]);
  
  // Get next available lesson
  const nextLesson = useMemo(() => {
    if (currentAvailableIndex < 0 || currentAvailableIndex >= availableLessons.length - 1) {
      return null;
    }
    return availableLessons[currentAvailableIndex + 1];
  }, [currentAvailableIndex, availableLessons]);
  
  // Get previous available lesson
  const prevLesson = useMemo(() => {
    if (currentAvailableIndex <= 0 || !availableLessons.length) {
      return null;
    }
    return availableLessons[currentAvailableIndex - 1];
  }, [currentAvailableIndex, availableLessons]);
  
  // Navigation helpers
  const hasNext = !!nextLesson;
  const hasPrev = !!prevLesson;
  
  // Navigate to a specific lesson
  const goToLesson = useCallback((lessonId: string) => {
    if (!courseSlug) return;
    router.push(`/viewer/${courseSlug}/lesson/${lessonId}`);
  }, [router, courseSlug]);
  
  // Navigate to next lesson
  const goToNextLesson = useCallback(() => {
    if (!nextLesson || !currentLessonId) return;
    
    // Auto-mark current lesson as completed when moving to next
    if (autoMarkCompleteOnNext) {
      markLessonCompleted(currentLessonId);
    }
    
    goToLesson(nextLesson.id);
  }, [nextLesson, currentLessonId, autoMarkCompleteOnNext, markLessonCompleted, goToLesson]);
  
  // Navigate to previous lesson
  const goToPrevLesson = useCallback(() => {
    if (!prevLesson) return;
    goToLesson(prevLesson.id);
  }, [prevLesson, goToLesson]);
  
  // Go to course overview
  const goToCourseOverview = useCallback(() => {
    if (!courseSlug) return;
    router.push(`/viewer/${courseSlug}`);
  }, [router, courseSlug]);
  
  return {
    currentLessonIndex,
    totalLessons,
    nextLesson,
    prevLesson,
    hasNext,
    hasPrev,
    goToNextLesson,
    goToPrevLesson,
    goToLesson,
    goToCourseOverview
  };
}
