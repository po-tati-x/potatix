import { useMemo } from 'react';
import { useDashboardData } from './use-dashboard';
import type { CourseProgressData, RevenueData as UiRevenueData, TopPerformingCourse } from '@/components/features/dashboard/types';
import type { Course } from '@/lib/shared/types/courses';

// Minimal API shape until backend types are strict
interface ApiCourseProgress {
  courseId: string;
  completionRate: number;
}
interface ApiCourseRevenue {
  courseId: string;
  title: string;
  revenue: number;
}

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

  const progress: ApiCourseProgress[] = useMemo(
    () => (data?.progressData as ApiCourseProgress[] | undefined) ?? [],
    [data?.progressData]
  );
  
  // Transform the API data to the UI component format
  const adaptedProgressData = useMemo(() => {
    if (progress.length === 0) return [];
    
    return progress.map((prog: ApiCourseProgress, index: number): CourseProgressData => {
      // Find the course to get the title
      const course = courses.find((c: Course) => c.id === prog.courseId);
      
      return {
        // Ensure unique ID by using courseId or generating one if missing
        id: prog.courseId || `progress-${index}`,
        title: course?.title || 'Unknown Course',
        activeStudents: course?.studentCount || 0,
        completionRate: prog.completionRate,
        // These fields aren't in the API data, so we provide defaults
        avgEngagement: 75, // Default value
        bottleneckLesson: 'N/A',
        dropoffRate: 100 - prog.completionRate,
      };
    });
  }, [progress, courses]);
  
  return {
    progressData: adaptedProgressData,
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
  
  // Re-use memoised courses and memo-ise the raw revenue blob so reference is stable
  const courses: Course[] = useMemo(
    () => (data?.courses as Course[] | undefined) ?? [],
    [data?.courses]
  );

  const apiData = useMemo(
    () => data?.revenueData as ({
      courseRevenue?: ApiCourseRevenue[];
      totalRevenue: number;
    } | undefined),
    [data?.revenueData]
  );
  
  // Transform the API data to the UI component format
  const adaptedRevenueData = useMemo(() => {
    if (!apiData) return null;
    
    // Calculate month-over-month change (mock data since API doesn't provide it)
    const momRevenueChange = 5.2; // Example: 5.2% increase
    
    // Safely handle courseRevenue being undefined
    const courseRevenue: ApiCourseRevenue[] = apiData.courseRevenue || [];
    
    // Convert courseRevenue to topPerformingCourses
    const topPerformingCourses: TopPerformingCourse[] = courseRevenue
      .slice(0, 3) // Take top 3
      .map((course: ApiCourseRevenue, index: number): TopPerformingCourse => ({
        // Ensure unique ID by using courseId or generating one if missing
        id: course.courseId || `revenue-course-${index}`,
        title: course.title,
        revenue: course.revenue,
        growth: Math.floor(Math.random() * 20) - 5, // Random growth between -5% and 15%
      }));
    
    // Calculate average metrics
    const totalStudents = courses.reduce((sum: number, course: Course) => sum + (course.studentCount ?? 0), 0);
    const avgRevenuePerStudent = totalStudents > 0 
      ? apiData.totalRevenue / totalStudents 
      : 0;
    
    const avgCourseValue = courseRevenue.length > 0
      ? apiData.totalRevenue / courseRevenue.length
      : 0;
    
    // Estimate monthly recurring revenue (mock data)
    const monthlyRecurringRevenue = apiData.totalRevenue * 0.08; // Example: 8% of total revenue is recurring
    
    return {
      totalRevenue: apiData.totalRevenue,
      momRevenueChange,
      avgRevenuePerStudent,
      avgCourseValue,
      monthlyRecurringRevenue,
      topPerformingCourses,
    } as UiRevenueData;
  }, [apiData, courses]);
  
  return {
    revenueData: adaptedRevenueData,
    courses,
    isLoading,
    error
  };
} 