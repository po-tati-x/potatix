import { NextRequest, NextResponse } from "next/server";
import { db, courseSchema } from "@potatix/db";
import { auth } from "@/lib/auth/auth";
import { eq, and, count, sql } from "drizzle-orm";

/**
 * API endpoint for fetching course progress metrics
 *
 * Metrics calculated:
 * 1. Active students per course
 * 2. Completion rate for each course
 * 3. Average engagement percentage
 * 4. Bottleneck lessons (where students get stuck)
 * 5. Drop-off rates
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

    // Get courses owned by this user
    const courses = await db
      .select({
        id: courseSchema.course.id,
        title: courseSchema.course.title,
      })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.userId, userId));

    if (!courses.length) {
      return NextResponse.json({
        progressData: [],
      });
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
        // This would aggregate lesson progress data to calculate how many students
        // have completed all lessons in the course
        const completionRateResult = await db
          .select({
            // This would be a calculation based on lessonProgress table
            // For now, we'll use a sample calculation
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

        // Cast the SQL result to a number to fix the TypeScript error
        const completionRateValue = completionRateResult[0]
          ?.completionRate as number;
        const completionRate = Math.round(completionRateValue || 0);

        // 3. Calculate average engagement
        // This would be based on watchTimeSeconds compared to total lesson duration
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

        // Cast the SQL result to a number to fix the TypeScript error
        const avgEngagementValue = engagementResult[0]?.avgEngagement as number;
        const avgEngagement = Math.round(avgEngagementValue || 0);

        // 4. Find bottleneck lesson
        // This would identify the lesson with lowest completion rate
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

        // Get the title of the bottleneck lesson
        let bottleneckLesson = "N/A";
        if (bottleneckResult.length > 0) {
          const lessonResult = await db
            .select({
              title: courseSchema.lesson.title,
            })
            .from(courseSchema.lesson)
            .where(eq(courseSchema.lesson.id, bottleneckResult[0].lessonId))
            .limit(1);

          bottleneckLesson = lessonResult[0]?.title || "N/A";
        }

        // 5. Calculate dropout rate
        // This is the percentage of students who haven't completed any lessons
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

        // Cast the SQL result to a number to fix the TypeScript error
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

    return NextResponse.json({
      progressData,
    });
  } catch (error) {
    console.error("Failed to fetch course progress metrics:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch progress metrics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
