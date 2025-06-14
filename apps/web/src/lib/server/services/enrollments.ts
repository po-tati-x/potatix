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
    const enrollments = await database
      .select()
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          eq(courseSchema.courseEnrollment.userId, userId),
          eq(courseSchema.courseEnrollment.courseId, courseId),
          eq(courseSchema.courseEnrollment.status, "active"),
        ),
      )
      .limit(1);
    
    if (!enrollments.length) {
      return { enrolled: false };
    }
    
    return { enrolled: true, enrollment: enrollments[0] };
  },
  
  async createEnrollment(data: EnrollmentCreateInput) {
    const enrollmentId = `enrollment-${nanoid()}`;
    
    // Check if user is already enrolled
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
      // If already enrolled but not active, update the status
      if (existingEnrollment[0].status !== "active") {
        await database
          .update(courseSchema.courseEnrollment)
          .set({
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(courseSchema.courseEnrollment.id, existingEnrollment[0].id));
      }
      
      return { id: existingEnrollment[0].id, enrollment: existingEnrollment[0], alreadyEnrolled: true };
    }
    
    // Insert new enrollment
    const newEnrollment = await database
      .insert(courseSchema.courseEnrollment)
      .values({
        id: enrollmentId,
        userId: data.userId,
        courseId: data.courseId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return { id: newEnrollment[0].id, enrollment: newEnrollment[0], alreadyEnrolled: false };
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