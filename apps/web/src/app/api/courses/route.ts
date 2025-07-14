import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import type { CourseCreateInput } from "@/lib/server/services/courses";
import type { ApiResponse } from "@/lib/shared/types/api";

// Schema validation
import {
  object,
  string as vString,
  number as vNumber,
  array as vArray,
  optional,
  parse,
} from "valibot";

const CreateCourseSchema = object({
  title: vString(),
  description: optional(vString()),
  price: optional(vNumber()),
  status: optional(vString()),
  imageUrl: optional(vString()),
  perks: optional(vArray(vString())),
  learningOutcomes: optional(vArray(vString())),
  prerequisites: optional(vArray(vString())),
});

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
    return NextResponse.json({ data: result, error: undefined } as ApiResponse<typeof result>);
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
    // Parse & validate request body
    let body: CourseCreateInput;
    try {
      body = parse(CreateCourseSchema, await request.json()) as CourseCreateInput;
    } catch {
      return createErrorResponse("Invalid request payload", 400);
    }

    // Create course input
    const courseInput: CourseCreateInput = {
      ...body,
      status: body.status ?? "draft",
      userId: auth.userId,
    };
    
    // Create course
    const course = await courseService.createCourse(courseInput);
    if (!course) {
      return createErrorResponse("Failed to create course", 500);
    }
    return NextResponse.json({ data: course, error: undefined } as ApiResponse<typeof course>, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create course:", error);
    return createErrorResponse(
      "Failed to create course", 
      500
    );
  }
}
