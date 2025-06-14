/**
 * Centralized query key factory for all React Query cache management
 * This is the single source of truth for all query keys in the application
 */

// Base query key structure
const createQueryKeyFactory = <T extends Record<string, unknown>>(baseKey: string, factories: T): T & { _key: readonly string[] } => {
  return {
    _key: [baseKey] as const,
    ...factories
  };
};

/**
 * Course-related query keys
 */
export const courseKeys = createQueryKeyFactory('course', {
  all: () => ['course'] as const,
  detail: (id: string) => ['course', id] as const,
  modules: (courseId: string) => ['course', courseId, 'module'] as const,
  module: (moduleId: string) => ['course', 'module', moduleId] as const,
  lessons: (courseId: string) => ['course', courseId, 'lesson'] as const,
  lesson: (lessonId: string) => ['course', 'lesson', lessonId] as const,
  bySlug: (slug: string) => ['course', 'slug', slug] as const,
  byUser: (userId: string) => ['course', 'user', userId] as const,
});

/**
 * User-related query keys
 */
export const userKeys = createQueryKeyFactory('user', {
  profile: () => ['user', 'profile'] as const,
  settings: () => ['user', 'settings'] as const,
  notifications: () => ['user', 'notifications'] as const,
  enrollments: (userId: string) => ['user', userId, 'enrollment'] as const,
});

/**
 * Dashboard-related query keys
 */
export const dashboardKeys = createQueryKeyFactory('dashboard', {
  all: () => ['dashboard'] as const,
  stats: () => ['dashboard', 'stats'] as const,
  courses: {
    all: () => ['dashboard', 'course'] as const,
    detail: (id: string) => ['dashboard', 'course', id] as const,
  },
  progress: {
    all: () => ['dashboard', 'progress'] as const,
    byCourse: (courseId: string) => ['dashboard', 'progress', courseId] as const,
  },
  revenue: {
    all: () => ['dashboard', 'revenue'] as const,
    byCourse: (courseId: string) => ['dashboard', 'revenue', courseId] as const,
  },
});

/**
 * Enrollment-related query keys
 */
export const enrollmentKeys = createQueryKeyFactory('enrollment', {
  all: () => ['enrollment'] as const,
  byCourse: (courseId: string) => ['enrollment', 'course', courseId] as const,
  byUser: (userId: string) => ['enrollment', 'user', userId] as const,
  detail: (enrollmentId: string) => ['enrollment', enrollmentId] as const,
});

/**
 * Lesson progress query keys
 */
export const progressKeys = createQueryKeyFactory('progress', {
  all: () => ['progress'] as const,
  byUser: (userId: string) => ['progress', 'user', userId] as const,
  byCourse: (courseId: string) => ['progress', 'course', courseId] as const,
  byLesson: (lessonId: string) => ['progress', 'lesson', lessonId] as const,
  detail: (userId: string, lessonId: string) => ['progress', 'user', userId, 'lesson', lessonId] as const,
});

/**
 * Video/Media query keys
 */
export const mediaKeys = createQueryKeyFactory('media', {
  all: () => ['media'] as const,
  upload: (uploadId: string) => ['media', 'upload', uploadId] as const,
  transcript: (videoId: string) => ['media', 'transcript', videoId] as const,
  playback: (playbackId: string) => ['media', 'playback', playbackId] as const,
});

/**
 * Analytics query keys
 */
export const analyticsKeys = createQueryKeyFactory('analytic', {
  all: () => ['analytic'] as const,
  course: (courseId: string) => ['analytic', 'course', courseId] as const,
  user: (userId: string) => ['analytic', 'user', userId] as const,
  engagement: (courseId: string) => ['analytic', 'engagement', courseId] as const,
});

/**
 * Legacy query keys for backward compatibility
 * @deprecated Use the specific key factories above instead
 */
export const queryKeys = {
  dashboard: dashboardKeys,
  course: courseKeys,
  user: userKeys,
  enrollment: enrollmentKeys,
  progress: progressKeys,
  media: mediaKeys,
  analytic: analyticsKeys,
};

/**
 * Helper function to invalidate all queries for a specific domain
 */
import type { QueryClient } from '@tanstack/react-query';

export const createInvalidateHelpers = (queryClient: QueryClient) => ({
  invalidateAllCourses: () => queryClient.invalidateQueries({ queryKey: courseKeys.all() }),
  invalidateAllUsers: () => queryClient.invalidateQueries({ queryKey: userKeys._key }),
  invalidateAllDashboard: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all() }),
  invalidateAllEnrollments: () => queryClient.invalidateQueries({ queryKey: enrollmentKeys.all() }),
  invalidateAllProgress: () => queryClient.invalidateQueries({ queryKey: progressKeys.all() }),
  invalidateAllMedia: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all() }),
  invalidateAllAnalytics: () => queryClient.invalidateQueries({ queryKey: analyticsKeys.all() }),
});

/**
 * Type-safe query key builder
 */
export type QueryKeyBuilder = {
  [K in keyof typeof queryKeys]: typeof queryKeys[K];
};
