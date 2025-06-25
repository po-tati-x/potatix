import { Course } from '@/lib/shared/types/courses';
import { UserProfile } from '@/lib/shared/types/profile';
import { CourseProgressData, RevenueData, StatsData } from '@/components/features/dashboard/types';
import { HeroMetrics } from '@/components/features/dashboard/types';

// Import the split services
import { profileService } from "./profile";
import { dashboardCoursesService } from "./dashboard-courses";
import { dashboardStatsService } from "./dashboard-stats";
import { dashboardProgressService } from "./dashboard-progress";
import { dashboardRevenueService } from "./dashboard-revenue";
import { dashboardHeroService } from './dashboard-hero';

// Dashboard response interface to fix implicit typing issues
interface DashboardData {
  profile: UserProfile | null;
  courses: Course[];
  stats: StatsData | null;
  progressData: CourseProgressData[];
  revenueData: RevenueData | null;
  heroMetrics: HeroMetrics;
}

/**
 * Dashboard service to handle all business logic for dashboard data
 */
export const dashboardService = {
  /**
   * Fetch all dashboard data for a user
   */
  async getAllDashboardData(userId: string): Promise<DashboardData> {
    // Kick off all slices in parallel – latency is dictated by the slowest one only
    const [profileRes, coursesRes, statsRes, progressRes, revenueRes, heroRes] = await Promise.allSettled([
      profileService.getUserProfile(userId),
      dashboardCoursesService.getUserCourses(userId),
      dashboardStatsService.getDashboardStats(userId),
      dashboardProgressService.getCourseProgress(userId),
      dashboardRevenueService.getRevenueInsights(userId),
      dashboardHeroService.getHeroMetrics(userId),
    ]);

    // Helper to unwrap settled results with fallback
    const unwrap = <T,>(res: PromiseSettledResult<T>, fallback: T): T =>
      res.status === 'fulfilled' ? res.value : fallback;

    return {
      profile: unwrap(profileRes, null),
      courses: unwrap(coursesRes, []),
      stats: unwrap(statsRes, null),
      progressData: unwrap(progressRes, []),
      revenueData: unwrap(revenueRes, null),
      heroMetrics: unwrap(heroRes, {
        revenueToday: 0,
        revenueMTD: 0,
        revenueAll: 0,
        enrollmentsToday: 0,
        enrollmentsMTD: 0,
        enrollmentsAll: 0,
        activeStudents: 0,
        avgRating: null,
        revenueTrend: [],
        enrollmentTrend: [],
      }),
    };
  }
};
