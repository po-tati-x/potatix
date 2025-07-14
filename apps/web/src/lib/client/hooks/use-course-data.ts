'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import type { Course } from '@/lib/shared/types/courses';
import type {
  CourseModule,
  Resource,
  DiscussionThread,
  UpcomingEvent,
  Note,
  CertificateRequirement,
  Achievement,
  CourseProgress,
  LearningStats,
} from '@/components/features/viewer/course-hub/types';
import type {
  CourseProgress as BackendCourseProgress,
  LearningStatistics,
  Achievement as BackendAchievement,
  UserNote as BackendUserNote,
  CertificateRequirement as BackendCertificateRequirement,
  LessonProgress,
} from '@/lib/shared/types/progress';
import { useCourseProgressStore } from '@/lib/client/stores/course-progress-store';
import {
  mapCourseProgress,
  mapLearningStats,
  mapUserNote,
  mapAchievement,
  mapCertificateRequirement,
  transformCourseToModules,
} from '@/lib/client/utils/type-mappers';

// API fetcher with error handling – unwraps our generic ApiResponse<T> shape
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    // Attach status for downstream logging/handling
    (error as Error & { cause?: unknown }).cause = {
      status: res.status,
      statusText: res.statusText,
    };
    throw error;
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

// Utility to ensure a value is a Map – converts plain objects produced by JSON.parse
function ensureMap<V>(value: unknown): Map<string, V> {
  if (value instanceof Map) return value as Map<string, V>;
  if (value && typeof value === 'object') {
    return new Map(Object.entries(value as Record<string, V>));
  }
  return new Map();
}

// Shape returned by useCourseData – explicit to avoid `any` leakage
export interface UseCourseDataResult {
  // Course data
  course: Course | undefined;
  modules: CourseModule[];

  // Progress data
  progress: CourseProgress;

  // Supplementary data
  resources: Resource[];
  discussions: DiscussionThread[];
  achievements: Achievement[];
  upcomingEvents: UpcomingEvent[];
  notes: Note[];
  certificateRequirements: CertificateRequirement[];

  // Loading / error states
  isLoading: boolean;
  isLoadingSupplementary: boolean;
  error: Error | undefined;
  hasSupplementaryError: boolean;

  // Mutations
  refetch: () => void;
  refetchProgress: () => void;
}

// Main hook for course data
export function useCourseData(courseSlug: string): UseCourseDataResult {
  const { currentCourseId, setCurrentCourse } = useCourseProgressStore();

  // Fetch course data
  const {
    data: course,
    error: courseError,
    isLoading: courseLoading,
    mutate: mutateCourse,
  } = useSWR<Course, Error>(courseSlug ? `/api/courses/slug/${courseSlug}` : undefined, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  // Fetch progress data
  const {
    data: progressData,
    error: progressError,
    isLoading: progressLoading,
    mutate: mutateProgress,
  } = useSWR<BackendCourseProgress, Error>(
    course?.id ? `/api/progress/courses/${course.id}` : undefined,
    fetcher,
    {
      refreshInterval: 30_000, // Refresh every 30 seconds
    },
  );

  // Fetch resources
  const {
    data: resources,
    error: resourcesError,
    isLoading: resourcesLoading,
  } = useSWR<Resource[], Error>(course?.id ? `/api/courses/${course.id}/resources` : undefined, fetcher);

  // Fetch discussions
  const {
    data: discussions,
    error: discussionsError,
    isLoading: discussionsLoading,
  } = useSWR<DiscussionThread[], Error>(
    course?.id ? `/api/courses/${course.id}/discussions?limit=10` : undefined,
    fetcher,
    {
      refreshInterval: 60_000, // Refresh every minute
    },
  );

  // Fetch achievements
  const {
    data: achievements,
    error: achievementsError,
    isLoading: achievementsLoading,
  } = useSWR<BackendAchievement[], Error>(
    course?.id ? `/api/users/me/achievements?courseId=${course.id}` : undefined,
    fetcher,
  );

  // Fetch upcoming events
  const {
    data: events,
    error: eventsError,
    isLoading: eventsLoading,
  } = useSWR<UpcomingEvent[], Error>(
    course?.id ? `/api/courses/${course.id}/events?upcoming=true` : undefined,
    fetcher,
    {
      refreshInterval: 300_000, // Refresh every 5 minutes
    },
  );

  // Fetch user notes
  const {
    data: notes,
    error: notesError,
    isLoading: notesLoading,
  } = useSWR<BackendUserNote[], Error>(
    course?.id ? `/api/courses/${course.id}/notes` : undefined,
    fetcher,
  );

  // Fetch certificate requirements
  const {
    data: certificateRequirements,
    error: certificateError,
    isLoading: certificateLoading,
  } = useSWR<BackendCertificateRequirement[], Error>(
    course?.id ? `/api/courses/${course.id}/certificate-requirements` : undefined,
    fetcher,
  );

  // Initialise course context + progress once data arrives, outside render
  useEffect(() => {
    if (!course?.id) return;

    if (course.id !== currentCourseId) {
      setCurrentCourse(course.id);
    }

    if (progressData) {
      // Normalise lessonProgress to a real Map so downstream code can safely call .get()
      const normalisedProgress: BackendCourseProgress = {
        ...progressData,
        lessonProgress: ensureMap<LessonProgress>(progressData.lessonProgress),
      };

      const map = ensureMap<BackendCourseProgress>(
        useCourseProgressStore.getState().courseProgress,
      );
      map.set(course.id, normalisedProgress);
      useCourseProgressStore.setState({ courseProgress: map });
    }
  }, [course?.id, progressData, currentCourseId, setCurrentCourse]);

  // Reactively subscribe to progress map – ensures UI updates when progress changes
  const rawCourseProgressMap = useCourseProgressStore(state => state.courseProgress);
  const courseProgressMap = ensureMap<BackendCourseProgress>(rawCourseProgressMap);

  const courseProgress = course?.id ? courseProgressMap.get(course.id) : undefined;
  // If we had to coerce the map (i.e., store held plain object), write it back once to keep consistency
  useEffect(() => {
    if (!(useCourseProgressStore.getState().courseProgress instanceof Map)) {
      useCourseProgressStore.setState({ courseProgress: courseProgressMap });
    }
  }, [courseProgressMap]);

  // Transform course lessons into modules
  const modules: CourseModule[] = course
    ? transformCourseToModules(course, courseProgress?.lessonProgress || new Map())
    : [];

  // Set current lesson if needed
  if (modules.length > 0 && courseProgress?.currentLessonId) {
    const currentLesson = modules
      .flatMap(m => m.lessons)
      .find(l => l.id === courseProgress.currentLessonId);
    if (currentLesson) {
      currentLesson.isCurrent = true;
    }
  }

  // Calculate aggregated loading and error states – only block on course data
  const isLoading = courseLoading || progressLoading;
  const isLoadingSupplementary =
    resourcesLoading ||
    discussionsLoading ||
    achievementsLoading ||
    eventsLoading ||
    notesLoading ||
    certificateLoading;

  // Only treat course fetch errors as fatal; auxiliary endpoints can fail silently
  const error = courseError;
  const hasSupplementaryError = Boolean(
    progressError ||
    resourcesError ||
    discussionsError ||
    achievementsError ||
    eventsError ||
    notesError ||
    certificateError,
  );

  return {
    // Course data
    course,
    modules,

    // Progress data
    progress: mapCourseProgress(
      progressData
        ? {
            ...progressData,
            lessonProgress: ensureMap<LessonProgress>(progressData.lessonProgress),
          }
        : undefined,
      course,
    ),

    // Supplementary data with defaults
    resources: (resources || []),
    discussions: (discussions || []),
    achievements: achievements?.map(mapAchievement) || [],
    upcomingEvents: (events || []),
    notes: (notes?.map(mapUserNote) || []),
    certificateRequirements:
      (certificateRequirements?.map(mapCertificateRequirement) || []),

    // Loading states
    isLoading,
    isLoadingSupplementary,

    // Error states
    error,
    hasSupplementaryError,

    // Mutations
    refetch: () => {
      void mutateCourse();
      void mutateProgress();
    },
    refetchProgress: () => {
      void mutateProgress();
    },
  };
}

// Hook for learning statistics
export function useLearningStats(): {
  stats: LearningStats;
  error: unknown;
  isLoading: boolean;
  refetch: () => void;
} {
  const {
    data: stats,
    error,
    isLoading,
    mutate,
  } = useSWR<LearningStatistics, Error>('/api/users/me/stats', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    stats: mapLearningStats(stats),
    error,
    isLoading,
    refetch: () => {
      void mutate();
    },
  };
}

// Hook for updating lesson progress
export function useUpdateLessonProgress() {
  const { completeLesson } = useCourseProgressStore();

  const updateProgress = async (lessonId: string, position: number, duration: number) => {
    try {
      // Update local state immediately (optimistic update)
      useCourseProgressStore.getState().updateWatchPosition(lessonId, position, duration);

      // Sync with backend
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, duration }),
      });
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
      // TODO: Show error toast
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      await completeLesson(lessonId);

      // Sync with backend
      await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      // TODO: Show error toast
    }
  };

  return {
    updateProgress,
    markLessonComplete,
  };
}
