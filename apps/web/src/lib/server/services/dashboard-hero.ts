import { getDb } from '@potatix/db';
import { sql } from 'drizzle-orm';
import { startOfDay, startOfMonth } from 'date-fns';

export interface HeroMetrics {
  revenueToday: number;
  revenueMTD: number;
  revenueAll: number;
  enrollmentsToday: number;
  enrollmentsMTD: number;
  enrollmentsAll: number;
  activeStudents: number;
  avgRating: number | null;
  revenueTrend: number[];
  enrollmentTrend: number[];
}

/**
 * Service to provide top-line hero metrics for the creator dashboard.
 */
export const dashboardHeroService = {
  async getHeroMetrics(userId: string): Promise<HeroMetrics> {
    const db = getDb();

    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());

    type Row = {
      revenue_today: number;
      revenue_mtd: number;
      revenue_all: number;
      enrollments_today: number;
      enrollments_mtd: number;
      enrollments_all: number;
      active_students: number;
      revenue_daily: number[];
      enrollments_daily: number[];
    };

    const result = await db.execute<Row>(sql<Row>`
      WITH creator_courses AS (
        SELECT id, price
        FROM course
        WHERE user_id = ${userId}
      ),
      enrollments AS (
        SELECT ce.*, cc.price
        FROM course_enrollment ce
        JOIN creator_courses cc ON cc.id = ce.course_id
        WHERE ce.status = 'active'
      ),
      last_30 AS (
        SELECT generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS day
      ),
      enroll_by_day AS (
        SELECT day::date                                     AS d,
               COALESCE(SUM(price),0)                        AS revenue,
               COUNT(enrollments.*)                          AS enroll
        FROM last_30 l
        LEFT JOIN enrollments ON date_trunc('day', enrollments.enrolled_at) = l.day
        GROUP BY d
        ORDER BY d
      ),
      daily AS (
        SELECT 
          array_agg(revenue ORDER BY d)     AS revenue_daily,
          array_agg(enroll ORDER BY d)      AS enrollments_daily
        FROM enroll_by_day
      ),
      today_enroll AS (
        SELECT
          COUNT(*)                                  AS enrollments_today,
          COALESCE(SUM(price), 0)                   AS revenue_today
        FROM enrollments
        WHERE enrolled_at >= ${today}
      ),
      mtd_enroll AS (
        SELECT
          COUNT(*)                                  AS enrollments_mtd,
          COALESCE(SUM(price), 0)                   AS revenue_mtd
        FROM enrollments
        WHERE enrolled_at >= ${monthStart}
      ),
      total_enroll AS (
        SELECT
          COUNT(*)                                  AS enrollments_all,
          COALESCE(SUM(price), 0)                   AS revenue_all
        FROM enrollments
      ),
      students AS (
        SELECT COUNT(DISTINCT user_id) AS active_students FROM enrollments
      )
      SELECT *, daily.revenue_daily, daily.enrollments_daily
      FROM today_enroll, mtd_enroll, total_enroll, students, daily;
    `);

    const row = result.rows?.[0] as Row | undefined;

    if (!row) {
      const emptyArr: number[] = Array(30).fill(0);
      return {
        revenueToday: 0,
        revenueMTD: 0,
        revenueAll: 0,
        enrollmentsToday: 0,
        enrollmentsMTD: 0,
        enrollmentsAll: 0,
        activeStudents: 0,
        avgRating: null,
        revenueTrend: emptyArr,
        enrollmentTrend: emptyArr,
      };
    }

    return {
      revenueToday: row.revenue_today ?? 0,
      revenueMTD: row.revenue_mtd ?? 0,
      revenueAll: row.revenue_all ?? 0,
      enrollmentsToday: row.enrollments_today ?? 0,
      enrollmentsMTD: row.enrollments_mtd ?? 0,
      enrollmentsAll: row.enrollments_all ?? 0,
      activeStudents: row.active_students ?? 0,
      avgRating: null, // Ratings not implemented yet
      revenueTrend: row.revenue_daily ?? [],
      enrollmentTrend: row.enrollments_daily ?? [],
    };
  },
}; 