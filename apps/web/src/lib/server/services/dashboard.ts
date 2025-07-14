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

// Dashboard response interface with explicit optional fields (avoid `null`)
interface DashboardData {
  profile?: UserProfile;
  courses: Course[];
  stats?: StatsData;
  progressData: CourseProgressData[];
  revenueData?: RevenueData;
  heroMetrics: HeroMetrics;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper – unwrap a PromiseSettledResult with a fallback
// Defined at module scope to satisfy unicorn/consistent-function-scoping.
// ─────────────────────────────────────────────────────────────────────────────

function unwrap<T>(res: PromiseSettledResult<T>, fallback: T): T {
  return res.status === 'fulfilled' ? res.value : fallback;
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

    const profile = profileRes.status === 'fulfilled' ? profileRes.value : undefined;
    const stats =
      statsRes.status === 'fulfilled' && statsRes.value !== null ? statsRes.value : undefined;
    const revenueData =
      revenueRes.status === 'fulfilled' && revenueRes.value !== undefined ? revenueRes.value : undefined;

    const heroMetricsDefault: HeroMetrics = {
      revenueToday: 0,
      revenueMTD: 0,
      revenueAll: 0,
      enrollmentsToday: 0,
      enrollmentsMTD: 0,
      enrollmentsAll: 0,
      activeStudents: 0,
      avgRating: undefined,
      revenueTrend: [],
      enrollmentTrend: [],
    };

    return {
      profile,
      courses: unwrap(coursesRes, []),
      stats,
      progressData: unwrap(progressRes, []),
      revenueData,
      heroMetrics: unwrap(heroRes, heroMetricsDefault),
    };
  }
};
