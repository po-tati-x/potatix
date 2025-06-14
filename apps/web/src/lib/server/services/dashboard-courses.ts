import { getDb, courseSchema } from "@potatix/db";
import { eq, and, count, desc } from "drizzle-orm";
import { Course } from '@/lib/shared/types/courses';

/**
 * Service for dashboard course operations
 */
export const dashboardCoursesService = {
  /**
   * Get user courses for dashboard
   */
  async getUserCourses(userId: string): Promise<Course[]> {
    const db = getDb();
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

        // Convert Date objects to ISO strings for API compatibility
        // Ensure status is properly typed as one of the required values
        const typedStatus = course.status === 'draft' || course.status === 'published' || course.status === 'archived'
          ? course.status
          : 'draft'; // Default to draft if invalid status

        return {
          ...course,
          description: course.description || undefined, // Convert null to undefined for Course type
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt?.toISOString(),
          status: typedStatus, // Ensure status is properly typed
          lessonCount: lessonCount.length,
          moduleCount: moduleCount.length,
          studentCount: studentCount,
        };
      }),
    );

    return coursesWithCounts as Course[];
  }
}; 