'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard';

// Import dashboard components
import {
  DashboardHeader,
  StatsGrid,
  CoursesPanel,
  ProfileCard,
} from '@/components/features/dashboard';

// Import our new real data components
import { CourseProgressTracking } from '@/components/features/dashboard/course-progress-tracking';
import { RevenueInsightsPanel } from '@/components/features/dashboard/revenue-insights-panel';

export default function DashboardPage() {
  const router = useRouter();
  const { fetchAllDashboardData, profile } = useDashboardStore();
  
  // Fetch all dashboard data on page load
  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);
  
  // Use profile name if available, otherwise fallback to "User"
  const userName = profile?.name || 'User';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <DashboardHeader 
        userName={userName}
        onCoursesClick={() => router.push('/courses')}
        onNewCourseClick={() => router.push('/courses/new')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats row - now uses dashboard store directly */}
          <StatsGrid />
          
          {/* Courses section - now uses dashboard store directly */}
          <CoursesPanel />
          
          {/* Course Progress Tracking - Real data component */}
          <CourseProgressTracking />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* User profile card - now uses dashboard store directly */}
          <ProfileCard />
          
          {/* Revenue Insights - Real data component */}
          <RevenueInsightsPanel />
        </div>
      </div>
    </div>
  );
} 