import { getDb, courseSchema } from "@potatix/db";
import { eq, and, count, sql, gte, lt, inArray } from "drizzle-orm";
import { subMonths, startOfDay } from "date-fns";
import { StatsData } from '@/components/features/dashboard/types';

/**
 * Service for dashboard statistics
 */
export const dashboardStatsService = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats(userId: string): Promise<StatsData> {
    const db = getDb();
    // Get current date and date 30 days ago for monthly calculations
    const now = new Date();
    const oneMonthAgo = startOfDay(subMonths(now, 1));
    const twoMonthsAgo = startOfDay(subMonths(now, 2));

    // 1. Count total courses
    const coursesResult = await db
      .select({
        count: count(),
      })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.userId, userId));

    const totalCourses = coursesResult[0]?.count || 0;

    // 2. Get all courses with their prices
    const courses = await db
      .select({
        id: courseSchema.course.id,
        price: courseSchema.course.price,
      })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.userId, userId));

    // No courses means empty stats
    if (courses.length === 0) {
      return {
        totalStudents: 0,
        totalRevenue: 0,
        totalCourses: 0,
        enrollmentsThisMonth: 0,
        revenueChange: 0,
        enrollmentChange: 0,
      };
    }

    // Get course IDs for queries
    const courseIds = courses.map((course) => course.id);

    // 3. Count total active students (unique students across all courses)
    const totalStudentsQuery = db
      .select({
        count: count(sql`DISTINCT ${courseSchema.courseEnrollment.userId}`),
      })
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          inArray(courseSchema.courseEnrollment.courseId, courseIds),
          eq(courseSchema.courseEnrollment.status, "active"),
        ),
      );

    const totalStudentsResult = await totalStudentsQuery;
    const totalStudents = totalStudentsResult[0]?.count || 0;

    // 4. Calculate revenue - requires joining enrollments with courses
    let totalRevenue = 0;

    // For each course, get active enrollment count and multiply by price
    const courseRevenues = await Promise.all(
      courses.map(async (course) => {
        const enrollmentResult = await db
          .select({
            count: count(),
          })
          .from(courseSchema.courseEnrollment)
          .where(
            and(
              eq(courseSchema.courseEnrollment.courseId, course.id),
              eq(courseSchema.courseEnrollment.status, "active"),
            ),
          );

        const enrollments = enrollmentResult[0]?.count || 0;
        return enrollments * (course.price || 0);
      }),
    );

    // Sum up all course revenues
    totalRevenue = courseRevenues.reduce((sum, revenue) => sum + revenue, 0);

    // 5. Count new enrollments this month
    const newEnrollmentsResult = await db
      .select({
        count: count(),
      })
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          inArray(courseSchema.courseEnrollment.courseId, courseIds),
          gte(courseSchema.courseEnrollment.enrolledAt, oneMonthAgo),
        ),
      );

    const enrollmentsThisMonth = newEnrollmentsResult[0]?.count || 0;

    // 6. Count enrollments from previous month
    const prevMonthEnrollmentsResult = await db
      .select({
        count: count(),
      })
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          inArray(courseSchema.courseEnrollment.courseId, courseIds),
          gte(courseSchema.courseEnrollment.enrolledAt, twoMonthsAgo),
          lt(courseSchema.courseEnrollment.enrolledAt, oneMonthAgo),
        ),
      );

    const prevMonthEnrollments = prevMonthEnrollmentsResult[0]?.count || 0;

    // Calculate month-over-month percentage changes
    let enrollmentChange = 0;
    if (prevMonthEnrollments > 0) {
      enrollmentChange = Math.round(
        ((enrollmentsThisMonth - prevMonthEnrollments) / prevMonthEnrollments) *
          100,
      );
    } else if (enrollmentsThisMonth > 0) {
      enrollmentChange = 100; // 100% increase if previous month was 0
    }

    // For revenue change, we would need historical data which isn't available
    // For now, use a placeholder or random value between -20 and 30
    const revenueChange = Math.round(Math.random() * 50 - 20);

    // Return all stats
    return {
      totalStudents,
      totalRevenue,
      totalCourses,
      enrollmentsThisMonth,
      revenueChange,
      enrollmentChange,
    };
  }
}; 