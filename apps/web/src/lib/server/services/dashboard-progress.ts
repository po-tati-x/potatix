import { getDb, courseSchema } from "@potatix/db";
import { eq, and, sql, count } from "drizzle-orm";
import { CourseProgressData } from '@/components/features/dashboard/types';

/**
 * Service for dashboard course progress metrics
 */
export const dashboardProgressService = {
  /**
   * Get course progress metrics
   */
  async getCourseProgress(userId: string): Promise<CourseProgressData[]> {
    const db = getDb();
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

        // Get the title of the bottleneck lesson
        let bottleneckLesson = "N/A";
        if (bottleneckResult.length > 0 && bottleneckResult[0]?.lessonId) {
          const lessonResult = await db
            .select({ title: courseSchema.lesson.title })
            .from(courseSchema.lesson)
            .where(eq(courseSchema.lesson.id, bottleneckResult[0].lessonId))
            .limit(1);

          bottleneckLesson = lessonResult[0]?.title ?? "N/A";
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
}; 