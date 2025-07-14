import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { lessonService } from "@/lib/server/services/lessons";

// Type guard – checks if auth result contains userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

interface Params {
  params: Promise<{ id: string; lessonId: string }>;
}

/**
 * GET /api/courses/[id]/lessons/[lessonId]
 * Returns full lesson details. Requires ownership authentication.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id: courseId, lessonId } = await params;

  const auth = await apiAuth(req);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
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

    return NextResponse.json({ data: ownership.lesson, error: undefined });
  } catch (error) {
    console.error("[API] lesson fetch", error);
    return createErrorResponse("Failed to fetch lesson", 500);
  }
} 