import { getDb } from "@potatix/db";
import { sql } from "drizzle-orm";
import { subMonths } from "date-fns";
import { RevenueData } from '@/components/features/dashboard/types';

/**
 * Service for dashboard revenue insights
 */
export const dashboardRevenueService = {
  /**
   * Get revenue insights
   */
  async getRevenueInsights(userId: string): Promise<RevenueData | null> {
    try {
      const db = getDb();

      const now = new Date();
      const oneMonthAgo = subMonths(now, 1);
      const twoMonthsAgo = subMonths(now, 2);

      type RevenueRow = {
        id: string;
        title: string;
        price: number;
        total_enrollments: number;
        month_enrollments: number;
        prev_enrollments: number;
      };

      // Single grouped query per course including monthly slices
      const result = await db.execute(sql<RevenueRow>`
        SELECT
          c.id,
          c.title,
          c.price,
          COUNT(ce.*) FILTER (WHERE ce.status = 'active')                                   AS total_enrollments,
          COUNT(ce.*) FILTER (WHERE ce.status = 'active' AND ce.enrolled_at >= ${oneMonthAgo}) AS month_enrollments,
          COUNT(ce.*) FILTER (
            WHERE ce.status = 'active'
              AND ce.enrolled_at >= ${twoMonthsAgo}
              AND ce.enrolled_at < ${oneMonthAgo}
          )                                                                                 AS prev_enrollments
        FROM course c
        LEFT JOIN course_enrollment ce ON ce.course_id = c.id
        WHERE c.user_id = ${userId}
        GROUP BY c.id;
      `);

      const rows = result.rows as RevenueRow[];

      if (!rows.length) {
        return null;
      }

      // Aggregate totals
      let totalRevenue = 0;
      let currentMonthRevenue = 0;
      let previousMonthRevenue = 0;
      let totalStudents = 0;

      const courseRevenueData = rows.map((row) => {
        // Ensure numeric types – Postgres may return bigint counts as strings
        const totalEnrollments = Number(row.total_enrollments) || 0;
        const monthEnrollments = Number(row.month_enrollments) || 0;
        const prevEnrollments = Number(row.prev_enrollments) || 0;

        const price = row.price || 0;

        const revenue = totalEnrollments * price;
        const revenueCurrent = monthEnrollments * price;
        const revenuePrev = prevEnrollments * price;

        totalRevenue += revenue;
        currentMonthRevenue += revenueCurrent;
        previousMonthRevenue += revenuePrev;
        totalStudents += totalEnrollments;

        const growth = prevEnrollments
          ? Math.round(((monthEnrollments - prevEnrollments) / prevEnrollments) * 100)
          : monthEnrollments > 0
            ? 100
            : 0;

        return {
          id: row.id,
          title: row.title,
          revenue,
          growth,
        };
      });

      // Sort top 3
      const topPerformingCourses = courseRevenueData
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      const momRevenueChange = previousMonthRevenue
        ? Math.round(
            ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100,
          )
        : currentMonthRevenue > 0
          ? 100
          : 0;

      const avgRevenuePerStudent = totalStudents
        ? Math.round(totalRevenue / totalStudents)
        : 0;

      const avgCourseValue = Math.round(totalRevenue / rows.length);

      return {
        totalRevenue,
        momRevenueChange,
        avgRevenuePerStudent,
        avgCourseValue,
        monthlyRecurringRevenue: currentMonthRevenue,
        topPerformingCourses,
      };
    } catch (error) {
      console.error("Error in getRevenueInsights:", error);
      throw error;
    }
  }
}; 