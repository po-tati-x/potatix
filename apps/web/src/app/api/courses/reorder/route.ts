import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { moduleService } from "@/lib/server/services/modules";
import { lessonService } from "@/lib/server/services/lessons";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * POST /api/courses/reorder
 * Reorder modules or lessons
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
    
    // Check for type field in URL or body
    const type = request.nextUrl.searchParams.get("type") || body.type;
    const courseId = body.courseId;
    const moduleId = body.moduleId;
    const orderedIds = body.orderedIds || body.items;
    
    // Validate required fields
    if (!type) {
      return createErrorResponse("Missing 'type' parameter (must be 'module' or 'lesson')", 400);
    }
    
    if (!courseId) {
      return createErrorResponse("Missing 'courseId' parameter", 400);
    }
    
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return createErrorResponse("Missing or invalid 'orderedIds' parameter (must be an array)", 400);
    }
    
    // Make sure the type is valid
    if (type !== "module" && type !== "lesson") {
      return createErrorResponse("Type must be 'module' or 'lesson'", 400);
    }
    
    // Check course ownership
    const ownershipCheck = await courseService.checkCourseOwnership(
      courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const err = ownershipCheck.error ?? { error: "Access denied", status: 403 };
      return createErrorResponse(err.error, err.status);
    }
    
    // Handle module reordering
    if (type === "module") {
      // Reorder modules
      const reorderedModules = await moduleService.reorderModules(
        courseId,
        orderedIds
      );
      
      return NextResponse.json({
        success: true,
        modules: reorderedModules,
      });
    }
    
    // Handle lesson reordering
    if (type === "lesson") {
      // Validate moduleId for lessons
      if (!moduleId) {
        return createErrorResponse("Missing 'moduleId' parameter for lesson reordering", 400);
      }
      
      if (orderedIds.length === 0) {
        return createErrorResponse("No lessons to reorder", 400);
      }
      
      // Get the module to verify it exists and belongs to the course
      const targetModule = await moduleService.getModuleById(moduleId);
      
      if (!targetModule) {
        return createErrorResponse("Module not found", 404);
      }
      
      if (targetModule.courseId !== courseId) {
        return createErrorResponse("Module does not belong to the specified course", 400);
      }
      
      // Reorder lessons
      const reorderedLessons = await lessonService.reorderLessons(
        moduleId,
        orderedIds
      );
      
      return NextResponse.json({
        success: true,
        lessons: reorderedLessons,
      });
    }
    
    // Should never reach here due to type validation above
    return createErrorResponse("Invalid type", 400);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number } | Error;
    console.error("[API] Failed to reorder items:", err);
    return createErrorResponse(
      ("message" in err && err.message) ? err.message : "Failed to reorder items",
      ("status" in err && err.status) ? err.status : 500
    );
  }
} 