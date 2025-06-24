import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { moduleService } from "@/lib/server/services/modules";
import type { ModuleCreateInput } from "@/lib/server/services/modules";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses/modules
 * Get modules for a course
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  // Get courseId from query params
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  
  if (!courseId) {
    return createErrorResponse("Course ID is required", 400);
  }
  
  try {
    // Check course ownership
    const ownershipCheck = await courseService.checkCourseOwnership(
      courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const err = ownershipCheck.error;
      return createErrorResponse(err?.error ?? "Access denied", err?.status ?? 403);
    }
    
    // Get modules
    const modules = await moduleService.getModulesByCourseId(courseId);
    
    return NextResponse.json(modules);
  } catch (error) {
    console.error("[API] Failed to get modules:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch modules";
    return createErrorResponse(message, 500);
  }
}

/**
 * POST /api/courses/modules
 * Create a new module
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
    const courseId = body.courseId;
    
    if (!courseId) {
      return createErrorResponse("Course ID is required", 400);
    }
    
    // Check course ownership
    const ownershipCheck = await courseService.checkCourseOwnership(
      courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const err = ownershipCheck.error;
      return createErrorResponse(err?.error ?? "Access denied", err?.status ?? 403);
    }
    
    // Create module input
    const moduleInput: ModuleCreateInput = {
      title: body.title,
      description: body.description,
      order: body.order,
      courseId: courseId,
    };
    
    // Create module
    const createdModule = await moduleService.createModule(moduleInput);
    
    return NextResponse.json(createdModule, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create module:", error);
    const message = error instanceof Error ? error.message : "Failed to create module";
    return createErrorResponse(message, 500);
  }
} 