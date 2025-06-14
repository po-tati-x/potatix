'use client';

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/features/dashboard/dashboard-header';
import { StatsGrid } from '@/components/features/dashboard/stats-grid';
import { CoursesPanel } from '@/components/features/dashboard/courses-panel';
import { ProfileCard } from '@/components/features/dashboard/profile-card';
import { CourseProgressTracking } from '@/components/features/dashboard/course-progress-tracking';
import { RevenueInsightsPanel } from '@/components/features/dashboard/revenue-insights-panel';
import { DashboardContextProvider } from '@/lib/client/providers/dashboard-context';
import type { DashboardPayload } from '@/lib/client/providers/dashboard-context';

// Client component that handles interactivity and additional data fetching
export function DashboardClient({ initialData }: { initialData?: DashboardPayload } = {}) {
  const router = useRouter();
  
  const userName = initialData?.profile?.name ?? 'User';

  const handleCoursesClick = () => router.push('/courses');
  const handleNewCourseClick = () => router.push('/courses/new');

  return (
    <DashboardContextProvider initialData={initialData}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <DashboardHeader
          userName={userName}
          onCoursesClick={handleCoursesClick}
          onNewCourseClick={handleNewCourseClick}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StatsGrid />
            <CoursesPanel />
            <CourseProgressTracking />
          </div>
          
          <div className="space-y-6">
            <ProfileCard />
            <RevenueInsightsPanel />
          </div>
        </div>
      </div>
    </DashboardContextProvider>
  );
} 