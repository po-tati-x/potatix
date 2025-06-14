import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult, checkCourseOwnership } from "@/lib/auth/api-auth";
import { courseService, type CourseUpdateInput } from "@/lib/server/services/courses";
import type { ApiResponse } from "@/lib/shared/types/api";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses/[id]
 * Get course by ID
 */
export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.pathname.split("/").pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Check course ownership
    await checkCourseOwnership(courseId, auth.userId);
    
    // Get course with details
    const course = await courseService.getCourseWithDetails(courseId);
    
    if (!course) {
      return createErrorResponse("Course not found", 404);
    }
    
    return NextResponse.json({ data: course, error: null } as ApiResponse<typeof course>);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number } | Error;
    console.error("[API] Failed to get course:", err);
    return createErrorResponse(
      'message' in err && err.message ? err.message : "Failed to fetch course",
      'status' in err && err.status ? err.status : 500,
    );
  }
}

/**
 * PATCH /api/courses/[id]
 * Update course by ID
 */
export async function PATCH(request: NextRequest) {
  const courseId = request.nextUrl.pathname.split("/").pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Check course ownership
    await checkCourseOwnership(courseId, auth.userId);
    
    // Parse request body
    const body = await request.json();
    
    // Create update input
    const updateInput: CourseUpdateInput = {
      title: body.title,
      description: body.description,
      price: body.price,
      status: body.status,
      imageUrl: body.imageUrl,
      slug: body.slug,
    };
    
    // Update course
    const course = await courseService.updateCourse(courseId, updateInput);
    
    if (!course) {
      return createErrorResponse("Failed to update", 500);
    }
    return NextResponse.json({ data: course, error: null } as ApiResponse<typeof course>);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number } | Error;
    console.error("[API] Failed to update course:", err);
    return createErrorResponse(
      'message' in err && err.message ? err.message : "Failed to update course",
      'status' in err && err.status ? err.status : 500,
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course by ID
 */
export async function DELETE(request: NextRequest) {
  const courseId = request.nextUrl.pathname.split("/").pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Check course ownership
    await checkCourseOwnership(courseId, auth.userId);
    
    // Delete course
    const result = await courseService.deleteCourse(courseId);
    
    return NextResponse.json({ data: result, error: null } as ApiResponse<typeof result>);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number } | Error;
    console.error("[API] Failed to delete course:", err);
    return createErrorResponse(
      'message' in err && err.message ? err.message : "Failed to delete course",
      'status' in err && err.status ? err.status : 500,
    );
  }
} 