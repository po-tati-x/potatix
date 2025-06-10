import { NextRequest, NextResponse } from "next/server";
import { db, courseSchema } from "@potatix/db";
import { auth } from "@/lib/auth/auth";
import { eq, and, count, sql, gte } from "drizzle-orm";
import { subMonths } from "date-fns";

/**
 * API endpoint for fetching revenue insights
 *
 * Metrics calculated:
 * 1. Total revenue across all courses
 * 2. Month-over-month revenue change
 * 3. Average revenue per student
 * 4. Average course value
 * 5. Monthly recurring revenue
 * 6. Top performing courses by revenue
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const now = new Date();
    const oneMonthAgo = subMonths(now, 1);
    const twoMonthsAgo = subMonths(now, 2);

    // Get courses owned by this user
    const courses = await db
      .select({
        id: courseSchema.course.id,
        title: courseSchema.course.title,
        price: courseSchema.course.price,
      })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.userId, userId));

    if (!courses.length) {
      return NextResponse.json({
        revenueData: null,
      });
    }

    // Get all course IDs
    const courseIds = courses.map((course) => course.id);

    // 1. Calculate total revenue
    // This requires multiplying course price by number of active enrollments
    let totalRevenue = 0;

    for (const course of courses) {
      const enrollmentsResult = await db
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

      const enrollments = enrollmentsResult[0]?.count || 0;
      totalRevenue += enrollments * (course.price || 0);
    }

    // 2. Calculate month-over-month revenue change
    // Get enrollments from previous month
    const currentMonthEnrollments = await db
      .select({
        courseId: courseSchema.courseEnrollment.courseId,
        count: count(),
      })
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          sql`${courseSchema.courseEnrollment.courseId} IN (${courseIds.map((id) => `'${id}'`).join(",")})`,
          gte(courseSchema.courseEnrollment.enrolledAt, oneMonthAgo),
          eq(courseSchema.courseEnrollment.status, "active"),
        ),
      )
      .groupBy(courseSchema.courseEnrollment.courseId);

    const previousMonthEnrollments = await db
      .select({
        courseId: courseSchema.courseEnrollment.courseId,
        count: count(),
      })
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          sql`${courseSchema.courseEnrollment.courseId} IN (${courseIds.map((id) => `'${id}'`).join(",")})`,
          gte(courseSchema.courseEnrollment.enrolledAt, twoMonthsAgo),
          sql`${courseSchema.courseEnrollment.enrolledAt} < ${oneMonthAgo.toISOString()}`,
          eq(courseSchema.courseEnrollment.status, "active"),
        ),
      )
      .groupBy(courseSchema.courseEnrollment.courseId);

    // Calculate revenue for current and previous months
    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;

    for (const enrollment of currentMonthEnrollments) {
      const course = courses.find((c) => c.id === enrollment.courseId);
      if (course) {
        currentMonthRevenue += enrollment.count * (course.price || 0);
      }
    }

    for (const enrollment of previousMonthEnrollments) {
      const course = courses.find((c) => c.id === enrollment.courseId);
      if (course) {
        previousMonthRevenue += enrollment.count * (course.price || 0);
      }
    }

    // Calculate percentage change
    let momRevenueChange = 0;
    if (previousMonthRevenue > 0) {
      momRevenueChange = Math.round(
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
          100,
      );
    } else if (currentMonthRevenue > 0) {
      momRevenueChange = 100; // 100% increase if previous month was 0
    }

    // 3. Calculate average revenue per student
    // First, get total number of unique students
    const totalStudentsResult = await db
      .select({
        count: count(sql`DISTINCT ${courseSchema.courseEnrollment.userId}`),
      })
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          sql`${courseSchema.courseEnrollment.courseId} IN (${courseIds.map((id) => `'${id}'`).join(",")})`,
          eq(courseSchema.courseEnrollment.status, "active"),
        ),
      );

    const totalStudents = totalStudentsResult[0]?.count || 0;
    const avgRevenuePerStudent =
      totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0;

    // 4. Calculate average course value
    const avgCourseValue =
      courses.length > 0 ? Math.round(totalRevenue / courses.length) : 0;

    // 5. Calculate monthly recurring revenue
    // For simplicity, we'll use the current month's revenue
    const monthlyRecurringRevenue = currentMonthRevenue;

    // 6. Get top performing courses by revenue
    // We'll need to calculate revenue for each course
    const courseRevenueData = await Promise.all(
      courses.map(async (course) => {
        const enrollmentsResult = await db
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

        const enrollments = enrollmentsResult[0]?.count || 0;
        const revenue = enrollments * (course.price || 0);

        // Calculate growth rate
        const lastMonthEnrollment = previousMonthEnrollments.find(
          (e) => e.courseId === course.id,
        );
        const thisMonthEnrollment = currentMonthEnrollments.find(
          (e) => e.courseId === course.id,
        );

        const lastMonthCount = lastMonthEnrollment
          ? lastMonthEnrollment.count
          : 0;
        const thisMonthCount = thisMonthEnrollment
          ? thisMonthEnrollment.count
          : 0;

        let growth = 0;
        if (lastMonthCount > 0) {
          growth = Math.round(
            ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100,
          );
        } else if (thisMonthCount > 0) {
          growth = 100;
        }

        return {
          id: course.id,
          title: course.title,
          revenue,
          growth,
        };
      }),
    );

    // Sort by revenue descending
    const topPerformingCourses = courseRevenueData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3); // Top 3 courses

    return NextResponse.json({
      revenueData: {
        totalRevenue,
        momRevenueChange,
        avgRevenuePerStudent,
        avgCourseValue,
        monthlyRecurringRevenue,
        topPerformingCourses,
      },
    });
  } catch (error) {
    console.error("Failed to fetch revenue insights:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch revenue insights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
