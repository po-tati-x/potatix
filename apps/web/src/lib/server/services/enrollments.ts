import { db, courseSchema, authSchema } from "@potatix/db";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Types
export interface EnrollmentCreateInput {
  userId: string;
  courseId: string;
}

export interface EnrollmentUpdateInput {
  status: "active" | "pending" | "rejected";
}

export interface PaginationParams {
  page: number;
  limit: number;
}

const database = db!; // assume singleton initialized

// Enrollment Service
export const enrollmentService = {
  async checkEnrollment(userId: string, courseId: string) {
    // Always fetch the latest enrollment regardless of status so we can
    // surface "pending" / "rejected" states to the client. We keep the
    // result limited to one because a user can only have a single active
    // enrollment record at a time.
    const enrollments = await database
      .select()
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          eq(courseSchema.courseEnrollment.userId, userId),
          eq(courseSchema.courseEnrollment.courseId, courseId),
        ),
      )
      .orderBy(desc(courseSchema.courseEnrollment.createdAt))
      .limit(1);
    
    if (!enrollments.length) {
      return { enrolled: false };
    }
    
    const latest = enrollments[0]!;
    const isActive = latest.status === "active";

    return { enrolled: isActive, status: latest.status, enrollment: latest };
  },
  
  async createEnrollment(data: EnrollmentCreateInput) {
    const enrollmentId = `enrollment-${nanoid()}`;
    
    // Check if user is already enrolled/requested – return early to avoid
    // mutating the status implicitly.
    const existingEnrollment = await database
      .select()
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          eq(courseSchema.courseEnrollment.userId, data.userId),
          eq(courseSchema.courseEnrollment.courseId, data.courseId),
        ),
      )
      .limit(1);
    
    if (existingEnrollment.length > 0) {
      const existing = existingEnrollment[0]!;
      return { id: existing.id, enrollment: existing, alreadyEnrolled: true };
    }

    // Figure out whether the course is paid – paid courses require instructor
    // approval and therefore start as "pending", free courses activate
    // immediately.
    const course = await database
      .select({ price: courseSchema.course.price })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.id, data.courseId))
      .limit(1);

    const price = course[0]?.price ?? 0;
    const initialStatus: "active" | "pending" = price > 0 ? "pending" : "active";

    // Insert new enrollment
    const newEnrollment = await database
      .insert(courseSchema.courseEnrollment)
      .values({
        id: enrollmentId,
        userId: data.userId,
        courseId: data.courseId,
        status: initialStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    const created = newEnrollment[0]!; // ensure non-undefined after insert
    return { id: created.id, enrollment: created, alreadyEnrolled: false };
  },
  
  async updateEnrollment(enrollmentId: string, data: EnrollmentUpdateInput) {
    const updatedEnrollment = await database
      .update(courseSchema.courseEnrollment)
      .set({
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(courseSchema.courseEnrollment.id, enrollmentId))
      .returning();
    
    return updatedEnrollment[0];
  },
  
  async getCourseStudents(courseId: string) {
    const students = await database
      .select({
        id: courseSchema.courseEnrollment.id,
        userId: courseSchema.courseEnrollment.userId,
        status: courseSchema.courseEnrollment.status,
        enrolledAt: courseSchema.courseEnrollment.enrolledAt,
        name: authSchema.user.name,
        email: authSchema.user.email,
      })
      .from(courseSchema.courseEnrollment)
      .leftJoin(authSchema.user, eq(courseSchema.courseEnrollment.userId, authSchema.user.id))
      .where(eq(courseSchema.courseEnrollment.courseId, courseId))
      .orderBy(desc(courseSchema.courseEnrollment.enrolledAt));
    
    return students;
  },
  
  async getStudentCourses(userId: string) {
    const enrollments = await database
      .select({
        enrollmentId: courseSchema.courseEnrollment.id,
        courseId: courseSchema.courseEnrollment.courseId,
        status: courseSchema.courseEnrollment.status,
        createdAt: courseSchema.courseEnrollment.createdAt,
        title: courseSchema.course.title,
        description: courseSchema.course.description,
        imageUrl: courseSchema.course.imageUrl,
        slug: courseSchema.course.slug,
        instructorId: courseSchema.course.userId,
      })
      .from(courseSchema.courseEnrollment)
      .innerJoin(
        courseSchema.course,
        eq(courseSchema.courseEnrollment.courseId, courseSchema.course.id)
      )
      .where(
        and(
          eq(courseSchema.courseEnrollment.userId, userId),
          eq(courseSchema.courseEnrollment.status, "active")
        )
      )
      .orderBy(desc(courseSchema.courseEnrollment.createdAt));
    
    return enrollments;
  }
} 