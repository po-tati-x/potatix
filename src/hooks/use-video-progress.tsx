import { useCallback } from 'react';
import { useViewerStore } from '@/lib/stores/viewer';

interface UseVideoProgressOptions {
  lessonId?: string;
  autoMarkCompleteThreshold?: number; // Percentage threshold to auto-mark complete (0-100)
}

interface UseVideoProgressReturn {
  progress: number;
  isCompleted: boolean;
  setProgress: (progress: number) => void;
  markComplete: () => void;
  markIncomplete: () => void;
}

/**
 * Hook to manage video progress and completion status
 */
export function useVideoProgress({
  lessonId,
  autoMarkCompleteThreshold = 90
}: UseVideoProgressOptions = {}): UseVideoProgressReturn {
  const {
    lessonProgress,
    completedLessons,
    setLessonProgress,
    markLessonCompleted,
    markLessonIncomplete
  } = useViewerStore();

  // Current progress value (0-100)
  const progress = lessonId ? (lessonProgress[lessonId] || 0) : 0;
  
  // Completion status
  const isCompleted = lessonId ? completedLessons.includes(lessonId) : false;

  // Set progress and auto-mark as complete if threshold reached
  const setProgress = useCallback((newProgress: number) => {
    if (!lessonId) return;
    
    setLessonProgress(lessonId, newProgress);
    
    // Auto-mark as completed if reached threshold
    if (newProgress >= autoMarkCompleteThreshold && !isCompleted) {
      markLessonCompleted(lessonId);
    }
  }, [lessonId, isCompleted, setLessonProgress, markLessonCompleted, autoMarkCompleteThreshold]);

  // Mark lesson as complete
  const markComplete = useCallback(() => {
    if (!lessonId) return;
    markLessonCompleted(lessonId);
  }, [lessonId, markLessonCompleted]);

  // Mark lesson as incomplete
  const markIncomplete = useCallback(() => {
    if (!lessonId) return;
    markLessonIncomplete(lessonId);
  }, [lessonId, markLessonIncomplete]);

  return {
    progress,
    isCompleted,
    setProgress,
    markComplete,
    markIncomplete
  };
}
