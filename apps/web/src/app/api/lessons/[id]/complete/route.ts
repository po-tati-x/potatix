import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { db, courseSchema } from "@potatix/db";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return "userId" in auth && typeof auth.userId === "string";
}

export async function POST(request: NextRequest) {
  const pathParts = request.nextUrl.pathname.split("/").filter(Boolean);
  const lessonIdMaybe = pathParts[pathParts.length - 2]; // /lessons/:id/complete
  if (!lessonIdMaybe) {
    return createErrorResponse("Lesson ID not found in path", 400);
  }
  const lessonId = lessonIdMaybe as string;

  // Auth
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  // Get lesson row for courseId
  const lessonRows = await db!
    .select({ courseId: courseSchema.lesson.courseId })
    .from(courseSchema.lesson)
    .where(eq(courseSchema.lesson.id, lessonId))
    .limit(1);

  if (!lessonRows.length) {
    return createErrorResponse("Lesson not found", 404);
  }
  const courseId = lessonRows[0]!.courseId;

  const { lessonProgress } = courseSchema;
  const now = new Date();

  // upsert progress row and set completed timestamp
  const existing = await db!
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.lessonId, lessonId), eq(lessonProgress.userId, auth.userId)))
    .limit(1);

  if (existing.length) {
    await db!
      .update(lessonProgress)
      .set({ completed: now, updatedAt: now })
      .where(eq(lessonProgress.id, existing[0]!.id));
  } else {
    await db!.insert(lessonProgress).values({
      id: `lp-${nanoid()}`,
      userId: auth.userId,
      lessonId,
      courseId,
      completed: now,
      watchTimeSeconds: 0,
      lastPosition: 0,
      createdAt: now,
      updatedAt: now,
    } as any);
  }

  return NextResponse.json({ success: true });
} 