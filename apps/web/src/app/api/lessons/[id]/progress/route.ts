import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { database, courseSchema } from "@potatix/db";
import { eq, and } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { nanoid } from "nanoid";

// Type guard – we reuse pattern from other routes
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return "userId" in auth && typeof auth.userId === "string";
}

interface BodyInput {
  position: number; // current position (seconds)
  duration: number; // total duration (seconds)
}

export async function PUT(request: NextRequest) {
  const pathParts = request.nextUrl.pathname.split("/").filter(Boolean);
  const lessonIdMaybe = pathParts.at(-2); // /lessons/:id/progress
  if (!lessonIdMaybe) {
    return createErrorResponse("Lesson ID not found in path", 400);
  }
  const lessonId = lessonIdMaybe;

  // Auth
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  let body: BodyInput;
  try {
    body = (await request.json()) as BodyInput;
  } catch {
    return createErrorResponse("Invalid JSON body", 400);
  }

  const { position, duration } = body;
  if (
    typeof position !== "number" ||
    typeof duration !== "number" ||
    position < 0 ||
    duration <= 0
  ) {
    return createErrorResponse("Invalid position/duration", 400);
  }

  // Get lesson to retrieve courseId
  const lessonRows = await database
    .select({ courseId: courseSchema.lesson.courseId })
    .from(courseSchema.lesson)
    .where(eq(courseSchema.lesson.id, lessonId))
    .limit(1);

  if (lessonRows.length === 0) {
    return createErrorResponse("Lesson not found", 404);
  }

  const courseId = lessonRows[0]!.courseId;
  const { lessonProgress } = courseSchema;

  // Check if progress row exists
  const existingRows = await database
    .select()
    .from(lessonProgress)
    .where(
      and(eq(lessonProgress.lessonId, lessonId), eq(lessonProgress.userId, auth.userId)),
    )
    .limit(1);

  const now = new Date();
  if (existingRows.length > 0) {
    const existing = existingRows[0]!;
    const newWatch = Math.max(existing.watchTimeSeconds ?? 0, position);
    await database
      .update(lessonProgress)
      .set({
        lastPosition: position,
        watchTimeSeconds: newWatch,
        updatedAt: now,
      })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    type LessonProgressInsert = InferInsertModel<typeof lessonProgress>;

    const newProgress: LessonProgressInsert = {
      id: `lp-${nanoid()}`,
      userId: auth.userId,
      lessonId,
      courseId,
      lastPosition: position,
      watchTimeSeconds: position,
      createdAt: now,
      updatedAt: now,
    };

    await database.insert(lessonProgress).values(newProgress);
  }

  return NextResponse.json({ success: true });
} 