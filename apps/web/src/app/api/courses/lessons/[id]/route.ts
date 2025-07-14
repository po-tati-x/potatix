import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { lessonService } from "@/lib/server/services/lessons";
import type { LessonUpdateInput } from "@/lib/server/services/lessons";
import { z } from "zod";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses/lessons/[id]
 * Get lesson by ID
 */
export async function GET(request: NextRequest) {
  const lessonId = request.nextUrl.pathname.split("/").pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get lesson
    const lesson = await lessonService.getLessonById(lessonId);
    
    if (!lesson) {
      return createErrorResponse("Lesson not found", 404);
    }
    
    // Check lesson ownership
    const ownershipCheck = await lessonService.checkLessonOwnership(
      lessonId,
      lesson.courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const errObj = typeof ownershipCheck.error === "object" && ownershipCheck.error !== null ? ownershipCheck.error as { error: string; status: number } : undefined;
      return createErrorResponse(errObj?.error ?? "Access denied", errObj?.status ?? 403);
    }
    
    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[API] Failed to get lesson:", error);
    return createErrorResponse(
      "Failed to fetch lesson", 
      500
    );
  }
}

/**
 * PATCH /api/courses/lessons/[id]
 * Update lesson by ID
 */
export async function PATCH(request: NextRequest) {
  const lessonId = request.nextUrl.pathname.split("/").pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get lesson to check ownership
    const lesson = await lessonService.getLessonById(lessonId);
    
    if (!lesson) {
      return createErrorResponse("Lesson not found", 404);
    }
    
    // Check lesson ownership
    const ownershipCheck = await lessonService.checkLessonOwnership(
      lessonId,
      lesson.courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const errObj = typeof ownershipCheck.error === "object" && ownershipCheck.error !== null ? ownershipCheck.error as { error: string; status: number } : undefined;
      return createErrorResponse(errObj?.error ?? "Access denied", errObj?.status ?? 403);
    }
    
    // Parse and validate request body
    const bodySchema = z.object({
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      playbackId: z.string().nullable().optional(),
      uploadStatus: z.string().optional(),
      order: z.number().int().optional(),
      visibility: z.enum(["public", "enrolled"]).optional(),
      transcriptData: z.unknown().optional(),
    });

    const body = bodySchema.parse(await request.json());

    // Body is now strongly typed; spread to update input
    const updateInput: LessonUpdateInput = { ...body };
    
    // Update lesson
    const updatedLesson = await lessonService.updateLesson(lessonId, updateInput);
    
    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("[API] Failed to update lesson:", error);
    return createErrorResponse(
      "Failed to update lesson", 
      500
    );
  }
}

/**
 * DELETE /api/courses/lessons/[id]
 * Delete lesson by ID
 */
export async function DELETE(request: NextRequest) {
  const lessonId = request.nextUrl.pathname.split("/").pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get lesson to check ownership
    const lesson = await lessonService.getLessonById(lessonId);
    
    if (!lesson) {
      return createErrorResponse("Lesson not found", 404);
    }
    
    // Check lesson ownership
    const ownershipCheck = await lessonService.checkLessonOwnership(
      lessonId,
      lesson.courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const errObj = typeof ownershipCheck.error === "object" && ownershipCheck.error !== null ? ownershipCheck.error as { error: string; status: number } : undefined;
      return createErrorResponse(errObj?.error ?? "Access denied", errObj?.status ?? 403);
    }
    
    // Delete lesson
    const result = await lessonService.deleteLesson(lessonId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Failed to delete lesson:", error);
    return createErrorResponse(
      "Failed to delete lesson", 
      500
    );
  }
} 