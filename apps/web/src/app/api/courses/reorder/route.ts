import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { moduleService } from "@/lib/server/services/modules";
import { lessonService } from "@/lib/server/services/lessons";
import { z } from "zod";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

const ModuleReorderSchema = z.object({
  type: z.literal("module"),
  courseId: z.string(),
  orderedIds: z.array(z.string()),
});

const LessonReorderSchema = z.object({
  type: z.literal("lesson"),
  courseId: z.string(),
  moduleId: z.string(),
  orderedIds: z.array(z.string()),
});

const LessonMultiSchema = z.object({
  type: z.literal("lesson-multi"),
  courseId: z.string(),
  modules: z.array(
    z.object({
      moduleId: z.string(),
      lessonIds: z.array(z.string()),
    }),
  ),
});

const BodySchema = z.discriminatedUnion("type", [
  ModuleReorderSchema,
  LessonReorderSchema,
  LessonMultiSchema,
]);

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
    // Parse & validate body (throws 400 on failure)
    const parsed = BodySchema.parse(await request.json());
    const { courseId } = parsed;

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
    if (parsed.type === "module") {
      const { orderedIds } = parsed;
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
    
    // Handle lesson reordering (within one module)
    if (parsed.type === "lesson") {
      const { moduleId, orderedIds } = parsed;

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
    if (parsed.type === "lesson-multi") {
      const { modules } = parsed;

      // Validate each module belongs to course
      for (const mod of modules) {
        const moduleRow = await moduleService.getModuleById(mod.moduleId);
        if (!moduleRow || moduleRow.courseId !== courseId) {
          return createErrorResponse("Module mismatch with course", 400);
        }
      }

      // Perform reorder across modules
      const updatedLessons = await lessonService.reorderLessonsAcrossModules(courseId, modules);

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