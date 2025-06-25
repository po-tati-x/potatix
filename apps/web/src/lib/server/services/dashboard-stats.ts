import { getDb } from "@potatix/db";
import { sql } from "drizzle-orm";
import { subMonths, startOfDay } from "date-fns";
import { StatsData } from '@/components/features/dashboard/types';

type StatsRow = {
  total_courses: number;
  total_students: number;
  total_revenue: number;
  enrollments_this_month: number;
  prev_month_enrollments: number;
  revenue_current: number;
  revenue_prev: number;
};

/**
 * Service for dashboard statistics
 */
export const dashboardStatsService = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats(userId: string): Promise<StatsData> {
    const db = getDb();

    const now = new Date();
    const oneMonthAgo = startOfDay(subMonths(now, 1));
    const twoMonthsAgo = startOfDay(subMonths(now, 2));

    // Single aggregated query using CTEs – zero per-course loops
    const execResult = await db.execute(sql<StatsRow>`
      WITH courses AS (
        SELECT id, price
        FROM course
        WHERE user_id = ${userId}
      ),
      enrollments AS (
        SELECT ce.*, c.price
        FROM course_enrollment ce
        JOIN courses c ON c.id = ce.course_id
        WHERE ce.status = 'active'
      ),
      current_month AS (
        SELECT COUNT(*)        AS enrollments_this_month,
               COALESCE(SUM(price),0) AS revenue_current
        FROM enrollments
        WHERE enrolled_at >= ${oneMonthAgo}
      ),
      prev_month AS (
        SELECT COUNT(*)        AS prev_month_enrollments,
               COALESCE(SUM(price),0) AS revenue_prev
        FROM enrollments
        WHERE enrolled_at >= ${twoMonthsAgo} AND enrolled_at < ${oneMonthAgo}
      )
      SELECT 
        (SELECT COUNT(*) FROM courses)                              AS total_courses,
        (SELECT COUNT(DISTINCT user_id) FROM enrollments)            AS total_students,
        (SELECT COALESCE(SUM(price),0) FROM enrollments)            AS total_revenue,
        current_month.enrollments_this_month,
        prev_month.prev_month_enrollments,
        current_month.revenue_current,
        prev_month.revenue_prev
      FROM current_month, prev_month;
    `);

    const row = execResult.rows?.[0] as StatsRow | undefined;

    if (!row) {
      return {
        totalStudents: 0,
        totalRevenue: 0,
        totalCourses: 0,
        enrollmentsThisMonth: 0,
        revenueChange: 0,
        enrollmentChange: 0,
      };
    }

    const {
      total_courses,
      total_students,
      total_revenue,
      enrollments_this_month,
      prev_month_enrollments,
      revenue_current,
      revenue_prev,
    } = row;

    const enrollmentChange = prev_month_enrollments
      ? Math.round(
          ((enrollments_this_month - prev_month_enrollments) / prev_month_enrollments) *
            100,
        )
      : enrollments_this_month > 0
        ? 100
        : 0;

    const revenueChange = revenue_prev
      ? Math.round(((revenue_current - revenue_prev) / revenue_prev) * 100)
      : revenue_current > 0
        ? 100
        : 0;

    return {
      totalStudents: total_students,
      totalRevenue: total_revenue,
      totalCourses: total_courses,
      enrollmentsThisMonth: enrollments_this_month,
      revenueChange,
      enrollmentChange,
    };
  }
}; 