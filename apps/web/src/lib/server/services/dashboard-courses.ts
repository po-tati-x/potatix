import { getDatabase, courseSchema } from "@potatix/db";
import { eq, sql, desc } from "drizzle-orm";
import { Course } from '@/lib/shared/types/courses';

/**
 * Service for dashboard course operations
 */
export const dashboardCoursesService = {
  /**
   * Get user courses for dashboard
   */
  async getUserCourses(userId: string): Promise<Course[]> {
    const db = getDatabase();

    // Single aggregated query – no N+1
    const rows = await db
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

        lessonCount: sql<number>`COUNT(DISTINCT ${courseSchema.lesson.id})`,
        moduleCount: sql<number>`COUNT(DISTINCT ${courseSchema.courseModule.id})`,
        studentCount: sql<number>`COUNT(DISTINCT ${courseSchema.courseEnrollment.userId}) FILTER (WHERE ${courseSchema.courseEnrollment.status} = 'active')`,
      })
      .from(courseSchema.course)
      .leftJoin(
        courseSchema.lesson,
        eq(courseSchema.lesson.courseId, courseSchema.course.id),
      )
      .leftJoin(
        courseSchema.courseModule,
        eq(courseSchema.courseModule.courseId, courseSchema.course.id),
      )
      .leftJoin(
        courseSchema.courseEnrollment,
        eq(courseSchema.courseEnrollment.courseId, courseSchema.course.id),
      )
      .where(eq(courseSchema.course.userId, userId))
      .groupBy(courseSchema.course.id)
      .orderBy(desc(courseSchema.course.updatedAt));

    const mapped: Course[] = rows.map((course) => ({
      ...course,
      description: course.description || undefined,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt?.toISOString(),
      status:
        course.status === 'draft' ||
        course.status === 'published' ||
        course.status === 'archived'
          ? course.status
          : 'draft',
    })) as Course[];

    return mapped;
  }
}; 