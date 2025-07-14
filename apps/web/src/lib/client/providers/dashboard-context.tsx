'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/lib/shared/constants/query-keys';
import type { CourseProgressData, RevenueData, StatsData, HeroMetrics } from '@/components/features/dashboard/types';
import type { Course } from '@/lib/shared/types/courses';
import type { UserProfile } from '@/lib/shared/types/profile';
import { useDashboardData } from '@/lib/client/hooks/use-dashboard';
import { dashboardApi } from '@/lib/client/api/dashboard';
import type { DashboardData as ApiDashboardData } from '@/lib/client/api/dashboard';

// Base context type with shared status and actions
interface DashboardBaseContext {
  isLoading: boolean;
  error: Error | undefined;
  refreshDashboard: () => void;
}

// Specialized context interfaces for each data slice
interface StatsContext extends DashboardBaseContext {
  stats: StatsData | undefined;
}

interface ProfileContext extends DashboardBaseContext {
  profile: UserProfile | undefined;
}

interface CoursesContext extends DashboardBaseContext {
  courses: Course[] | undefined;
}

interface ProgressContext extends DashboardBaseContext {
  progressData: CourseProgressData[] | undefined;
}

interface RevenueContext extends DashboardBaseContext {
  revenueData: RevenueData | undefined;
}

interface HeroMetricsContext extends DashboardBaseContext {
  heroMetrics: HeroMetrics | undefined;
}

// Complete dashboard context that combines all slices
type DashboardContextType = StatsContext & 
  ProfileContext & 
  CoursesContext & 
  ProgressContext & 
  RevenueContext &
  HeroMetricsContext & {
    // Main data reference
    dashboardData: ApiDashboardData | undefined;
  };

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export type DashboardPayload = Partial<ApiDashboardData> & {
  stats?: StatsData | undefined;
  profile?: UserProfile | undefined;
  courses?: Course[];
  progressData?: CourseProgressData[];
  revenueData?: RevenueData;
};

interface DashboardContextProviderProps {
  children: ReactNode;
  initialData?: DashboardPayload;
}

export function DashboardContextProvider({ children, initialData }: DashboardContextProviderProps) {
  const queryClient = useQueryClient();
  
  const queryResult = useDashboardData(
    initialData ? { initialData: initialData as ApiDashboardData, enabled: false } : undefined,
  );

  const dashboardData = (initialData as ApiDashboardData | undefined) ?? queryResult.data;
  const isLoading = initialData ? false : queryResult.isLoading;
  const error = queryResult.error ?? undefined;

  // Refresh function
  const refreshDashboard = () => {
    void queryClient.fetchQuery({
      queryKey: dashboardKeys.all(),
      queryFn: () => dashboardApi.getAllDashboardData(),
      staleTime: 0,
    });
  };
  
  // Create the context value with all derived data
  const value: DashboardContextType = {
    dashboardData,
    
    // Derived data slices with type assertions to handle the mapping
    stats: (dashboardData?.stats ?? undefined) as StatsData | undefined,
    profile: (dashboardData?.profile ?? undefined) as UserProfile | undefined,
    courses: (dashboardData?.courses ?? []) as Course[],
    progressData: dashboardData?.progressData as CourseProgressData[] | undefined,
    revenueData: dashboardData?.revenueData as RevenueData | undefined,
    heroMetrics: dashboardData?.heroMetrics as HeroMetrics | undefined,
    
    // Status
    isLoading,
    error,
    
    // Actions
    refreshDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook to use the dashboard context
export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardContextProvider');
  }
  return context;
}

// Specialized hooks that derive from the context
export function useStats(): StatsContext {
  const { stats, isLoading, error, refreshDashboard } = useDashboardContext();
  return { stats, isLoading, error, refreshDashboard };
}

export function useProfile(): ProfileContext {
  const { profile, isLoading, error, refreshDashboard } = useDashboardContext();
  return { profile, isLoading, error, refreshDashboard };
}

export function useCourses(): CoursesContext {
  const { courses, isLoading, error, refreshDashboard } = useDashboardContext();
  return { courses, isLoading, error, refreshDashboard };
}

export function useProgressData(): ProgressContext {
  const { progressData, isLoading, error, refreshDashboard } = useDashboardContext();
  return { progressData, isLoading, error, refreshDashboard };
}

export function useRevenueData(): RevenueContext {
  const { revenueData, isLoading, error, refreshDashboard } = useDashboardContext();
  return { revenueData, isLoading, error, refreshDashboard };
}

export function useHeroMetrics(): HeroMetricsContext {
  const { heroMetrics, isLoading, error, refreshDashboard } = useDashboardContext();
  return { heroMetrics, isLoading, error, refreshDashboard };
} 