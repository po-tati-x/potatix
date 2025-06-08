import { create } from 'zustand';
import { signOut } from '@/lib/auth/auth-client';
import { StatsData } from '@/components/features/dashboard/types';
import { Course } from '@/lib/types/api';
import { UserProfile } from '@/lib/types/profile';

// Type definition for Zustand's set function to avoid errors
type SetState<T> = {
  (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: false
  ): void;
  (state: T | ((state: T) => T), replace: true): void;
};

// Interfaces for the new data types
interface CourseProgressData {
  id: string;
  title: string;
  activeStudents: number;
  completionRate: number;
  avgEngagement: number;
  bottleneckLesson: string;
  dropoffRate: number;
}

interface RevenueData {
  totalRevenue: number;
  momRevenueChange: number;
  avgRevenuePerStudent: number;
  avgCourseValue: number;
  monthlyRecurringRevenue: number;
  topPerformingCourses: {
    id: string;
    title: string;
    revenue: number;
    growth: number;
  }[];
}

interface DashboardState {
  // Stats data and state
  stats: StatsData | null;
  isStatsLoading: boolean;
  statsError: Error | null;
  
  // Profile data and state
  profile: UserProfile | null;
  isProfileLoading: boolean;
  profileError: Error | null;
  
  // Courses data and state
  courses: Course[];
  isCoursesLoading: boolean;
  coursesError: Error | null;
  
  // Course Progress data and state
  progressData: CourseProgressData[];
  isProgressLoading: boolean;
  progressError: Error | null;
  
  // Revenue data and state
  revenueData: RevenueData | null;
  isRevenueLoading: boolean;
  revenueError: Error | null;
  
  // Actions
  fetchStats: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchProgressData: () => Promise<void>;
  fetchRevenueData: () => Promise<void>;
  fetchAllDashboardData: () => Promise<void>;
  
  // User actions
  signOut: () => Promise<void>;
}

// Type-safe fetch utility that handles errors consistently
async function apiFetch<T>(
  url: string,
  options: { errorMsg?: string; unwrapKey?: string } = {}
): Promise<T> {
  const { errorMsg = 'API request failed', unwrapKey } = options;
  const response = await fetch(url);
  
  // Check content type
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorMsg);
    } else {
      const text = await response.text();
      console.error('Non-JSON error response:', text.substring(0, 500) + '...');
      throw new Error(`API error: ${response.status}`);
    }
  }
  
  // Only parse as JSON if the content type is correct
  if (contentType?.includes('application/json')) {
    const data = await response.json();
    // Return either the entire response or a specific key from it
    return unwrapKey ? data[unwrapKey] : data;
  } else {
    console.error('Unexpected content type from API');
    throw new Error('API returned non-JSON response');
  }
}

// Shared error handler for all fetch operations
function handleFetchError(
  errorKey: 'statsError' | 'profileError' | 'coursesError' | 'progressError' | 'revenueError',
  loadingKey: 'isStatsLoading' | 'isProfileLoading' | 'isCoursesLoading' | 'isProgressLoading' | 'isRevenueLoading',
  error: unknown,
  set: SetState<DashboardState>
): void {
  console.error(`Error fetching data (${errorKey}):`, error);
  set({ 
    [errorKey]: error instanceof Error ? error : new Error('Unknown error'), 
    [loadingKey]: false 
  });
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial states
  stats: null,
  isStatsLoading: false,
  statsError: null,
  
  profile: null,
  isProfileLoading: false,
  profileError: null,
  
  courses: [],
  isCoursesLoading: false,
  coursesError: null,
  
  progressData: [],
  isProgressLoading: false,
  progressError: null,
  
  revenueData: null,
  isRevenueLoading: false,
  revenueError: null,
  
  // Fetch dashboard stats
  fetchStats: async () => {
    try {
      set({ isStatsLoading: true, statsError: null });
      const data = await apiFetch<{stats: StatsData}>(
        '/api/dashboard/stats',
        { errorMsg: 'Failed to fetch stats' }
      );
      set({ stats: data.stats, isStatsLoading: false });
    } catch (error) {
      handleFetchError('statsError', 'isStatsLoading', error, set);
    }
  },
  
  // Fetch user profile
  fetchProfile: async () => {
    try {
      set({ isProfileLoading: true, profileError: null });
      const profile = await apiFetch<UserProfile>(
        '/api/user/profile',
        { errorMsg: 'Failed to fetch profile' }
      );
      set({ profile, isProfileLoading: false });
    } catch (error) {
      handleFetchError('profileError', 'isProfileLoading', error, set);
    }
  },
  
  // Fetch courses
  fetchCourses: async () => {
    try {
      set({ isCoursesLoading: true, coursesError: null });
      const data = await apiFetch<{courses: Course[]}>(
        '/api/courses',
        { errorMsg: 'Failed to fetch courses' }
      );
      set({ courses: data.courses, isCoursesLoading: false });
    } catch (error) {
      handleFetchError('coursesError', 'isCoursesLoading', error, set);
    }
  },
  
  // Fetch course progress data
  fetchProgressData: async () => {
    // Don't fetch if there are no courses
    const { courses } = get();
    if (!courses.length) {
      set({ progressData: [], isProgressLoading: false });
      return;
    }
    
    try {
      set({ isProgressLoading: true, progressError: null });
      const data = await apiFetch<{progressData: CourseProgressData[]}>(
        '/api/courses/progress-metrics',
        { errorMsg: 'Failed to fetch course progress metrics' }
      );
      set({ progressData: data.progressData, isProgressLoading: false });
    } catch (error) {
      handleFetchError('progressError', 'isProgressLoading', error, set);
    }
  },
  
  // Fetch revenue insights data
  fetchRevenueData: async () => {
    // Don't fetch if there are no courses
    const { courses } = get();
    if (!courses.length) {
      set({ revenueData: null, isRevenueLoading: false });
      return;
    }
    
    try {
      set({ isRevenueLoading: true, revenueError: null });
      const data = await apiFetch<{revenueData: RevenueData}>(
        '/api/revenue/insights',
        { errorMsg: 'Failed to fetch revenue insights' }
      );
      set({ revenueData: data.revenueData, isRevenueLoading: false });
    } catch (error) {
      handleFetchError('revenueError', 'isRevenueLoading', error, set);
    }
  },
  
  // Fetch all dashboard data at once
  fetchAllDashboardData: async () => {
    const { fetchStats, fetchProfile, fetchCourses } = get();
    
    // First, fetch the core data - we need courses to be loaded before progress/revenue
    await Promise.allSettled([
      fetchStats(),
      fetchProfile(),
      fetchCourses()
    ]);
    
    // Now fetch data that depends on courses being loaded
    const { courses, fetchProgressData, fetchRevenueData } = get();
    if (courses.length > 0) {
      await Promise.allSettled([
        fetchProgressData(),
        fetchRevenueData()
      ]);
    }
  },
  
  // Sign out action
  signOut: async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear the store state on sign out
            set({
              stats: null,
              profile: null,
              courses: [],
              progressData: [],
              revenueData: null
            });
          }
        }
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
}));
