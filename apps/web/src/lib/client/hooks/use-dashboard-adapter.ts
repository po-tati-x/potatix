import { useMemo } from 'react';
import { useDashboardData } from './use-dashboard';
import type { CourseProgressData, RevenueData as UiRevenueData } from '@/components/features/dashboard/types';
import type { Course } from '@/lib/shared/types/courses';

/**
 * Adapter hook to convert API CourseProgress to UI CourseProgressData
 */
export function useCourseProgressData() {
  const { data, isLoading, error } = useDashboardData();
  
  // Memoize derived collections to maintain stable references
  const courses: Course[] = useMemo(
    () => (data?.courses as Course[] | undefined) ?? [],
    [data?.courses]
  );

  const progress: CourseProgressData[] = useMemo(
    () => (data?.progressData as CourseProgressData[] | undefined) ?? [],
    [data?.progressData]
  );
  
  // Ensure we always expose a stable, correctly-filled collection.
  const progressData = useMemo(() => {
    if (progress.length === 0) return [] as CourseProgressData[];

    return progress.map((p) => {
      // If the API missed title / activeStudents, hydrate from the courses map.
      const courseMeta = courses.find((c: Course) => c.id === p.id);

      return {
        ...p,
        title: p.title || courseMeta?.title || 'Unknown Course',
        activeStudents: p.activeStudents ?? courseMeta?.studentCount ?? 0,
      } as CourseProgressData;
    });
  }, [progress, courses]);
  
  return {
    progressData,
    courses,
    isLoading,
    error
  };
}

/**
 * Adapter hook to convert API RevenueData to UI RevenueData
 */
export function useRevenueInsightsData() {
  const { data, isLoading, error } = useDashboardData();

  // Coerce once to preserve reference.
  const revenueData: UiRevenueData | null = useMemo(
    () => (data?.revenueData as UiRevenueData | undefined) ?? null,
    [data?.revenueData]
  );

  const courses: Course[] = useMemo(
    () => (data?.courses as Course[] | undefined) ?? [],
    [data?.courses]
  );

  return {
    revenueData,
    courses,
    isLoading,
    error,
  };
} 