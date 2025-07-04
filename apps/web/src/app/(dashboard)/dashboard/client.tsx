'use client';

import { useRouter } from 'next/navigation';

import type { DashboardPayload } from '@/lib/client/providers/dashboard-context';

import { CourseProgressTracking } from '@/components/features/dashboard/course-progress-tracking';
import { CoursesPanel } from '@/components/features/dashboard/courses-panel';
import { DashboardHeader } from '@/components/features/dashboard/dashboard-header';
import { ProfileCard } from '@/components/features/dashboard/profile-card';
import { RevenueInsightsPanel } from '@/components/features/dashboard/revenue-insights-panel';
import { DashboardContextProvider } from '@/lib/client/providers/dashboard-context';
import { TopMetricsPanel } from '@/components/features/dashboard/top-metrics-panel';

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
            {/* Combined hero + stats */}
            <TopMetricsPanel />

            <CoursesPanel />
            <CourseProgressTracking />

            {/* TODO: Add student engagement feed component */}
          </div>
          
          <div className="space-y-6">
            <ProfileCard />
            <RevenueInsightsPanel />

            {/* TODO: Add onboarding checklist */}
          </div>
        </div>

        {/* TODO: Quick actions FAB to be implemented */}
      </div>
    </DashboardContextProvider>
  );
} 