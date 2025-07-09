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
    
    // Validate orderedIds only for single-module operations
    if ((type === "module" || type === "lesson") && (!orderedIds || !Array.isArray(orderedIds))) {
      return createErrorResponse("Missing or invalid 'orderedIds' parameter (must be an array)", 400);
    }

    // Make sure the type is valid
    if (type !== "module" && type !== "lesson" && type !== "lesson-multi") {
      return createErrorResponse("Type must be 'module', 'lesson' or 'lesson-multi'", 400);
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
        orderedIds,
      );

      const course = await courseService.getCourseById(courseId);
      if (course?.slug) {
        courseService.invalidateSlugCache(course.slug);
      }

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
        orderedIds,
      );

      // Invalidate in-memory slug caches so next fetch returns fresh order
      const course = await courseService.getCourseById(courseId);
      if (course?.slug) {
        courseService.invalidateSlugCache(course.slug);
      }

      return NextResponse.json({
        success: true,
        lessons: reorderedLessons,
      });
    }

    // Handle cross-module lesson reorder in one request
    if (type === "lesson-multi") {
      const modulesData = body.modules;
      if (!Array.isArray(modulesData) || !modulesData.length) {
        return createErrorResponse("'modules' array is required for lesson-multi", 400);
      }

      // Validate each module belongs to course
      for (const mod of modulesData) {
        if (!mod.moduleId || !Array.isArray(mod.lessonIds)) {
          return createErrorResponse("Each module entry must have moduleId and lessonIds", 400);
        }
        const moduleRow = await moduleService.getModuleById(mod.moduleId);
        if (!moduleRow || moduleRow.courseId !== courseId) {
          return createErrorResponse("Module mismatch with course", 400);
        }
      }

      // Perform reorder across modules
      const normalized = modulesData.map((m: any)=>({ moduleId: m.moduleId, lessonIds: m.lessonIds }));
      const updatedLessons = await lessonService.reorderLessonsAcrossModules(courseId, normalized);

      const course = await courseService.getCourseById(courseId);
      if (course?.slug) courseService.invalidateSlugCache(course.slug);

      return NextResponse.json({ success: true, lessons: updatedLessons });
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