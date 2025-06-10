import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@potatix/db";
import { course, courseEnrollment } from "@potatix/db/schemas/course";
import { eq, and } from "drizzle-orm";

// PATCH /api/courses/[id]/enrollment/[enrollmentId]
// Update enrollment status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> },
) {
  try {
    // Await the params promise
    const { id: courseId, enrollmentId } = await params;

    // Get the session using Better Auth's API
    const sessionResult = await auth.api.getSession({
      headers: request.headers,
    });

    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = sessionResult.user.id;

    // Parse request body to get new status
    const body = await request.json();
    const { status } = body;

    if (!status || !["active", "pending", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 },
      );
    }

    // Check if the current user is the course owner
    const courses = await db
      .select()
      .from(course)
      .where(and(eq(course.id, courseId), eq(course.userId, userId)));

    if (courses.length === 0) {
      return NextResponse.json(
        {
          error: "Course not found or you do not have permission to manage it",
        },
        { status: 403 },
      );
    }

    // Get the enrollment to verify it exists and belongs to this course
    const enrollments = await db
      .select()
      .from(courseEnrollment)
      .where(
        and(
          eq(courseEnrollment.id, enrollmentId),
          eq(courseEnrollment.courseId, courseId),
        ),
      );

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: "Enrollment not found or does not belong to this course" },
        { status: 404 },
      );
    }

    // Update the enrollment status
    const result = await db
      .update(courseEnrollment)
      .set({ status })
      .where(eq(courseEnrollment.id, enrollmentId))
      .returning();

    return NextResponse.json({
      message: "Enrollment status updated",
      enrollment: result[0],
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment status" },
      { status: 500 },
    );
  }
}
