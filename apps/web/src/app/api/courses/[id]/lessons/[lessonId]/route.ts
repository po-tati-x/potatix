import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { lessonService } from "@/lib/server/services/lessons";

interface Params {
  params: Promise<{ id: string; lessonId: string }>;
}

/**
 * GET /api/courses/[id]/lessons/[lessonId]
 * Returns full lesson details. Requires ownership authentication.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id: courseId, lessonId } = await params;

  const auth = await apiAuth(req) as AuthResult;
  // Type guard
  if (!('userId' in auth) || typeof auth.userId !== 'string') {
    return createErrorResponse((auth as any).error, (auth as any).status);
  }

  try {
    // Ensure the lesson belongs to user's course
    const ownership = await lessonService.checkLessonOwnership(
      lessonId,
      courseId,
      auth.userId,
    );

    if (!ownership.owned) {
      return createErrorResponse(ownership.error, ownership.status);
    }

    return NextResponse.json({ data: ownership.lesson, error: null });
  } catch (err) {
    console.error("[API] lesson fetch", err);
    return createErrorResponse("Failed to fetch lesson", 500);
  }
} 