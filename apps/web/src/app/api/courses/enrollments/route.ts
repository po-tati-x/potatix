import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { enrollmentService, type EnrollmentCreateInput } from "@/lib/server/services/enrollments";
import { z } from "zod";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses/enrollments
 * Get student courses or course students
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  // Get parameters from query
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  
  try {
    // If courseId is provided, get students for that course
    if (courseId) {
      const studentsRaw = await enrollmentService.getCourseStudents(courseId);

      // Transform to client-facing shape
      const students = studentsRaw.map((s) => ({
        id: s.id,
        userId: s.userId,
        courseId: courseId,
        enrolledAt: s.enrolledAt,
        status: s.status,
        user: {
          name: s.name ?? undefined,
          email: s.email ?? undefined,
        },
      }));

      return NextResponse.json(students);
    }
    
    // Otherwise, get courses the user is enrolled in
    const courses = await enrollmentService.getStudentCourses(auth.userId);
    return NextResponse.json(courses);
  } catch (error) {
    console.error("[API] Failed to get enrollments:", error);
    return createErrorResponse("Failed to fetch enrollments", 500);
  }
}

/**
 * POST /api/courses/enrollments
 * Create a new enrollment
 */
export async function POST(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Parse & validate request body
    const { courseId } = z
      .object({ courseId: z.string() })
      .parse(await request.json());
    
    if (!courseId) {
      return createErrorResponse("Course ID is required", 400);
    }
    
    // Create enrollment input
    const enrollmentInput: EnrollmentCreateInput = {
      userId: auth.userId,
      courseId,
    };
    
    // Create enrollment
    const enrollment = await enrollmentService.createEnrollment(enrollmentInput);
    
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create enrollment:", error);
    return createErrorResponse("Failed to create enrollment", 500);
  }
} 