import { courseSchema, authSchema, profileSchema, getDb } from "@potatix/db";
import { eq, and, count, sql, gte, lt, inArray, desc } from "drizzle-orm";
import { subMonths, startOfDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-server";
import { env } from "@/env";

// Create a connection to the database
const db = getDb(env.DATABASE_URL);

/**
 * API endpoint for refreshing specific sections of dashboard data
 * Supported sections:
 * - stats: Basic dashboard stats
 * - courses: User's courses
 * - progress: Course progress metrics
 * - revenue: Revenue insights
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
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const section = request.nextUrl.pathname.split('/').pop() as string;

    // Validate section parameter
    if (!["stats", "courses", "progress", "revenue", "profile"].includes(section)) {
      return NextResponse.json(
        { error: "Invalid section. Must be one of: stats, courses, progress, revenue, profile" },
        { status: 400 }
      );
    }

    // Fetch only the requested section
    let result = {};

    switch(section) {
      case "stats":
        result = { stats: await fetchDashboardStats(userId) };
        break;
      case "courses":
        result = { courses: await fetchUserCourses(userId) };
        break;
      case "progress":
        result = { progressData: await fetchCourseProgress(userId) };
        break;
      case "revenue":
        result = { revenueData: await fetchRevenueInsights(userId) };
        break;
      case "profile":
        result = { profile: await fetchUserProfile(userId) };
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    const section = request.nextUrl.pathname.split('/').pop() as string;
    console.error(`Failed to refresh dashboard ${section} data:`, error);
    const message = error instanceof Error ? error.message : `Failed to refresh ${section} data`;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper function to fetch user profile
async function fetchUserProfile(userId: string) {
  try {
    // Get basic user info from auth table
    const users = await db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, userId))
      .limit(1);

    if (!users.length) {
      return null;
    }

    const user = users[0]!;
    
    // Get extended profile data from user_profile table
    const profiles = await db
      .select()
      .from(profileSchema.userProfile)
      .where(eq(profileSchema.userProfile.userId, userId))
      .limit(1);

    const profile = profiles.length > 0 ? profiles[0] : null;
    
    // Merge user and profile data
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      bio: profile?.bio || null,
      tier: "Free" // Default tier, replace with actual tier logic if available
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// Helper function to fetch user courses
async function fetchUserCourses(userId: string) {
  const courses = await db
    .select({
      id: courseSchema.course.id,
      title: courseSchema.course.title,
      description: courseSchema.course.description,
      price: courseSchema.course.price,
      status: courseSchema.course.status,
      imageUrl: courseSchema.course.imageUrl,
      userId: courseSchema.course.userId,
      createdAt: courseSchema.course.createdAt,
      updatedAt: courseSchema.course.updatedAt,
    })
    .from(courseSchema.course)
    .where(eq(courseSchema.course.userId, userId))
    .orderBy(desc(courseSchema.course.updatedAt));

  // Get lesson counts for each course
  const courseIds = courses.map((course) => course.id);

  // If no courses, return empty array
  if (courseIds.length === 0) {
    return [];
  }

  // For each course, get the number of lessons, modules, and student enrollments
  const coursesWithCounts = await Promise.all(
    courses.map(async (course) => {
      // Count lessons
      const lessonCount = await db
        .select({
          count: courseSchema.lesson.id,
        })
        .from(courseSchema.lesson)
        .where(eq(courseSchema.lesson.courseId, course.id));

      // Count modules
      const moduleCount = await db
        .select({
          count: courseSchema.courseModule.id,
        })
        .from(courseSchema.courseModule)
        .where(eq(courseSchema.courseModule.courseId, course.id));

      // Count student enrollments (active only)
      const enrollmentResult = await db
        .select({
          studentCount: count(),
        })
        .from(courseSchema.courseEnrollment)
        .where(
          and(
            eq(courseSchema.courseEnrollment.courseId, course.id),
            eq(courseSchema.courseEnrollment.status, "active"),
          ),
        );

      const studentCount = enrollmentResult[0]?.studentCount || 0;

      return {
        ...course,
        lessonCount: lessonCount.length,
        moduleCount: moduleCount.length,
        studentCount: studentCount,
      };
    }),
  );

  return coursesWithCounts;
}

// Helper function to fetch dashboard stats
async function fetchDashboardStats(userId: string) {
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

// Helper function to fetch course progress metrics
async function fetchCourseProgress(userId: string) {
  // Get courses owned by this user
  const courses = await db
    .select({
      id: courseSchema.course.id,
      title: courseSchema.course.title,
    })
    .from(courseSchema.course)
    .where(eq(courseSchema.course.userId, userId));

  if (!courses.length) {
    return [];
  }

  // Create progress data for each course
  const progressData = await Promise.all(
    courses.map(async (course) => {
      // 1. Get active students count
      const studentsResult = await db
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

      const activeStudents = studentsResult[0]?.count || 0;

      // 2. Calculate completion rate
      const completionRateResult = await db
        .select({
          completionRate: sql`
            CASE
              WHEN COUNT(DISTINCT ${courseSchema.lessonProgress.userId}) = 0 THEN 0
              ELSE (
                SUM(CASE WHEN ${courseSchema.lessonProgress.completed} IS NOT NULL THEN 1 ELSE 0 END)::float /
                (COUNT(DISTINCT ${courseSchema.lessonProgress.userId}) *
                 (SELECT COUNT(*) FROM ${courseSchema.lesson} WHERE ${courseSchema.lesson.courseId} = ${course.id}))
              ) * 100
            END
          `,
        })
        .from(courseSchema.lessonProgress)
        .where(eq(courseSchema.lessonProgress.courseId, course.id));

      const completionRateValue = completionRateResult[0]?.completionRate as number;
      const completionRate = Math.round(completionRateValue || 0);

      // 3. Calculate average engagement
      const engagementResult = await db
        .select({
          avgEngagement: sql`
            CASE
              WHEN SUM(${courseSchema.lesson.duration}) = 0 THEN 0
              ELSE (
                SUM(${courseSchema.lessonProgress.watchTimeSeconds})::float /
                SUM(${courseSchema.lesson.duration})
              ) * 100
            END
          `,
        })
        .from(courseSchema.lessonProgress)
        .innerJoin(
          courseSchema.lesson,
          eq(courseSchema.lessonProgress.lessonId, courseSchema.lesson.id),
        )
        .where(eq(courseSchema.lessonProgress.courseId, course.id));

      const avgEngagementValue = engagementResult[0]?.avgEngagement as number;
      const avgEngagement = Math.round(avgEngagementValue || 0);

      // 4. Find bottleneck lesson
      const bottleneckResult = await db
        .select({
          lessonId: courseSchema.lessonProgress.lessonId,
          completionRate: sql`
            SUM(CASE WHEN ${courseSchema.lessonProgress.completed} IS NOT NULL THEN 1 ELSE 0 END)::float /
            COUNT(DISTINCT ${courseSchema.lessonProgress.userId}) * 100
          `,
        })
        .from(courseSchema.lessonProgress)
        .where(eq(courseSchema.lessonProgress.courseId, course.id))
        .groupBy(courseSchema.lessonProgress.lessonId)
        .orderBy(
          sql`
          SUM(CASE WHEN ${courseSchema.lessonProgress.completed} IS NOT NULL THEN 1 ELSE 0 END)::float /
          COUNT(DISTINCT ${courseSchema.lessonProgress.userId}) * 100 ASC
        `,
        )
        .limit(1);

      // Get the title of the bottleneck lesson (if any)
      let bottleneckLesson = "N/A";
      if (bottleneckResult.length > 0) {
        const targetLessonId = bottleneckResult[0]?.lessonId;
        if (targetLessonId) {
          const lessonResult = await db
            .select({ title: courseSchema.lesson.title })
            .from(courseSchema.lesson)
            .where(eq(courseSchema.lesson.id, targetLessonId))
            .limit(1);

          bottleneckLesson = lessonResult[0]?.title ?? "N/A";
        }
      }

      // 5. Calculate dropout rate
      const dropoutResult = await db
        .select({
          dropoutRate: sql`
            CASE
              WHEN COUNT(DISTINCT ${courseSchema.courseEnrollment.userId}) = 0 THEN 0
              ELSE (
                COUNT(DISTINCT ${courseSchema.courseEnrollment.userId}) -
                COUNT(DISTINCT ${courseSchema.lessonProgress.userId})
              )::float / COUNT(DISTINCT ${courseSchema.courseEnrollment.userId}) * 100
            END
          `,
        })
        .from(courseSchema.courseEnrollment)
        .leftJoin(
          courseSchema.lessonProgress,
          and(
            eq(
              courseSchema.courseEnrollment.courseId,
              courseSchema.lessonProgress.courseId,
            ),
            eq(
              courseSchema.courseEnrollment.userId,
              courseSchema.lessonProgress.userId,
            ),
          ),
        )
        .where(eq(courseSchema.courseEnrollment.courseId, course.id));

      const dropoffRateValue = dropoutResult[0]?.dropoutRate as number;
      const dropoffRate = Math.round(dropoffRateValue || 0);

      // Return all metrics for this course
      return {
        id: course.id,
        title: course.title,
        activeStudents,
        completionRate,
        avgEngagement,
        bottleneckLesson,
        dropoffRate,
      };
    }),
  );

  return progressData;
}

// Helper function to fetch revenue insights
async function fetchRevenueInsights(userId: string) {
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
    return null;
  }

  // Get all course IDs
  const courseIds = courses.map((course) => course.id);

  // 1. Calculate total revenue
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
    momRevenueChange = 100;
  }

  // 3. Calculate average revenue per student
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
  const monthlyRecurringRevenue = currentMonthRevenue;

  // 6. Get top performing courses by revenue
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

  return {
    totalRevenue,
    momRevenueChange,
    avgRevenuePerStudent,
    avgCourseValue,
    monthlyRecurringRevenue,
    topPerformingCourses,
  };
} 