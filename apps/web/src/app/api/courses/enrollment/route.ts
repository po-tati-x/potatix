import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db, courseSchema } from "@potatix/db";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET /api/courses/enrollment?courseId=xxx
// Check if current user is enrolled in a course
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const courseSlug = searchParams.get("slug");

  try {
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

    // Get the course ID if only slug was provided
    let targetCourseId = courseId;

    if (!targetCourseId && courseSlug) {
      const courses = await db
        .select()
        .from(courseSchema.course)
        .where(eq(courseSchema.course.slug, courseSlug));

      if (courses.length === 0) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      targetCourseId = courses[0].id;
    }

    if (!targetCourseId) {
      return NextResponse.json(
        { error: "Course ID or slug is required" },
        { status: 400 },
      );
    }

    // Check if the user is enrolled
    const enrollments = await db
      .select()
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          eq(courseSchema.courseEnrollment.userId, userId),
          eq(courseSchema.courseEnrollment.courseId, targetCourseId),
        ),
      );

    const isEnrolled = enrollments.length > 0;

    return NextResponse.json({
      isEnrolled,
      enrollment: isEnrolled ? enrollments[0] : null,
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json(
      { error: "Failed to check enrollment status" },
      { status: 500 },
    );
  }
}

// POST /api/courses/enrollment
// Enroll the current user in a course
export async function POST(request: NextRequest) {
  try {
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

    // Parse the request body
    const body = await request.json();
    const { courseId, courseSlug } = body;

    // Get the course ID if only slug was provided
    let targetCourseId = courseId;
    let courseDetails = null;

    if (!targetCourseId && courseSlug) {
      const courses = await db
        .select()
        .from(courseSchema.course)
        .where(eq(courseSchema.course.slug, courseSlug));

      if (courses.length === 0) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      courseDetails = courses[0];
      targetCourseId = courseDetails.id;
    } else if (targetCourseId) {
      // If we only have courseId, fetch the course details
      const courses = await db
        .select()
        .from(courseSchema.course)
        .where(eq(courseSchema.course.id, targetCourseId));

      if (courses.length === 0) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }

      courseDetails = courses[0];
    }

    if (!targetCourseId || !courseDetails) {
      return NextResponse.json(
        { error: "Course ID or slug is required" },
        { status: 400 },
      );
    }

    // Check if the user is already enrolled
    const existingEnrollments = await db
      .select()
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          eq(courseSchema.courseEnrollment.userId, userId),
          eq(courseSchema.courseEnrollment.courseId, targetCourseId),
        ),
      );

    if (existingEnrollments.length > 0) {
      return NextResponse.json({
        message: "Already enrolled",
        enrollment: existingEnrollments[0],
      });
    }

    // Determine enrollment status based on course price
    // If course is free (price = 0), set status to 'active'
    // Otherwise, set status to 'pending' for instructor approval
    const enrollmentStatus = courseDetails.price === 0 ? "active" : "pending";

    // Create a new enrollment
    const newEnrollment = {
      id: uuidv4(),
      userId: userId,
      courseId: targetCourseId,
      status: enrollmentStatus,
    };

    const result = await db
      .insert(courseSchema.courseEnrollment)
      .values(newEnrollment)
      .returning();

    return NextResponse.json(
      {
        message:
          enrollmentStatus === "active"
            ? "Successfully enrolled"
            : "Enrollment request submitted",
        enrollment: result[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 },
    );
  }
}
