import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { moduleService } from "@/lib/server/services/modules";
import type { ModuleUpdateInput } from "@/lib/server/services/modules";
import { z } from "zod";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation schema – partial update allowed, all fields optional
// ─────────────────────────────────────────────────────────────────────────────

const modulePatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullish().optional(),
  order: z.number().int().optional(),
});

/**
 * GET /api/courses/modules/[id]
 * Get module by ID
 */
export async function GET(request: NextRequest) {
  const moduleId = request.nextUrl.pathname.split('/').pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get module
    const targetModule = await moduleService.getModuleById(moduleId);
    
    if (!targetModule) {
      return createErrorResponse("Module not found", 404);
    }
    
    // Check course ownership
    const ownershipCheck = await courseService.checkCourseOwnership(
      targetModule.courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const err = ownershipCheck.error;
      return createErrorResponse(err?.error ?? "Access denied", err?.status ?? 403);
    }
    
    return NextResponse.json(targetModule);
  } catch (error) {
    console.error("[API] Failed to get module:", error);
    return createErrorResponse("Failed to fetch module", 500);
  }
}

/**
 * PATCH /api/courses/modules/[id]
 * Update module by ID
 */
export async function PATCH(request: NextRequest) {
  const moduleId = request.nextUrl.pathname.split('/').pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get module to check ownership
    const targetModule = await moduleService.getModuleById(moduleId);
    
    if (!targetModule) {
      return createErrorResponse("Module not found", 404);
    }
    
    // Check course ownership
    const ownershipCheck = await courseService.checkCourseOwnership(
      targetModule.courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const err = ownershipCheck.error;
      return createErrorResponse(err?.error ?? "Access denied", err?.status ?? 403);
    }
    
    // Parse and validate request body
    const data = modulePatchSchema.parse(await request.json());

    const updateInput: ModuleUpdateInput = {
      ...('title' in data ? { title: data.title } : {}),
      ...('description' in data ? { description: data.description ?? undefined } : {}),
      ...('order' in data ? { order: data.order } : {}),
    };
    
    // Update module
    const updatedModule = await moduleService.updateModule(moduleId, updateInput);
    
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("[API] Failed to update module:", error);
    return createErrorResponse("Failed to update module", 500);
  }
}

/**
 * DELETE /api/courses/modules/[id]
 * Delete module by ID
 */
export async function DELETE(request: NextRequest) {
  const moduleId = request.nextUrl.pathname.split('/').pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get module to check ownership
    const targetModule = await moduleService.getModuleById(moduleId);
    
    if (!targetModule) {
      return createErrorResponse("Module not found", 404);
    }
    
    // Check course ownership
    const ownershipCheck = await courseService.checkCourseOwnership(
      targetModule.courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const err = ownershipCheck.error;
      return createErrorResponse(err?.error ?? "Access denied", err?.status ?? 403);
    }
    
    // Delete module
    const result = await moduleService.deleteModule(moduleId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Failed to delete module:", error);
    return createErrorResponse("Failed to delete module", 500);
  }
} 