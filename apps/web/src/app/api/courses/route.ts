import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { CourseCreateInput } from "@/lib/server/services/courses";
import type { ApiResponse } from "@/lib/shared/types/api";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses
 * List courses for authenticated user
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    
    // Get courses for the authenticated user (pagination param not used in service)
    const result = await courseService.getCoursesByUserId(auth.userId);
    return NextResponse.json({ data: result, error: null } as ApiResponse<typeof result>);
  } catch (error) {
    console.error("[API] Failed to get courses:", error);
    return createErrorResponse(
      "Failed to fetch courses", 
      500
    );
  }
}

/**
 * POST /api/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Create course input
    const courseInput: CourseCreateInput = {
      title: body.title,
      description: body.description,
      price: body.price,
      status: body.status || "draft",
      imageUrl: body.imageUrl,
      userId: auth.userId,
    };
    
    // Create course
    const course = await courseService.createCourse(courseInput);
    if (!course) {
      return createErrorResponse("Failed to create course", 500);
    }
    return NextResponse.json({ data: course, error: null } as ApiResponse<typeof course>, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create course:", error);
    return createErrorResponse(
      "Failed to create course", 
      500
    );
  }
}
