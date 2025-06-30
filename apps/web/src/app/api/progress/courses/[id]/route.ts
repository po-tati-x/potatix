import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { db, courseSchema } from "@potatix/db";
import { eq, and } from "drizzle-orm";
import type {
  CourseProgress as BackendCourseProgress,
  LessonProgress as BackendLessonProgress,
} from '@/lib/shared/types/progress';

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop() as string; // courseId param

  // Auth
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    // Total lessons in course
    const totalLessonsResult = await db!
      .select({ count: courseSchema.lesson.id })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, id));
    const totalLessons = totalLessonsResult.length;

    // Grab all lesson progress rows for this user & course
    const rows: Array<{
      id: string;
      lessonId: string;
      completed: Date | null;
      lastPosition: number | null;
      watchTimeSeconds: number | null;
      updatedAt: Date;
    }> = await db!
      .select({
        id: courseSchema.lessonProgress.id,
        lessonId: courseSchema.lessonProgress.lessonId,
        completed: courseSchema.lessonProgress.completed,
        lastPosition: courseSchema.lessonProgress.lastPosition,
        watchTimeSeconds: courseSchema.lessonProgress.watchTimeSeconds,
        updatedAt: courseSchema.lessonProgress.updatedAt,
      })
      .from(courseSchema.lessonProgress)
      .where(
        and(
          eq(courseSchema.lessonProgress.courseId, id),
          eq(courseSchema.lessonProgress.userId, auth.userId),
        ),
      );

    // Build map structure
    const lessonProgressEntries: Array<[string, BackendLessonProgress]> = rows.map((r) => [
      r.lessonId,
      {
        lessonId: r.lessonId,
        courseId: id,
        userId: auth.userId,
        status: r.completed ? 'completed' : 'in_progress',
        startedAt: undefined,
        completedAt: r.completed ?? undefined,
        lastWatchedAt: r.updatedAt,
        watchedDuration: r.watchTimeSeconds ?? 0,
        totalDuration: 0,
        lastPosition: r.lastPosition ?? 0,
        completionPercentage: r.completed ? 100 : 0,
        attempts: 0,
      },
    ]);

    const lessonMap = lessonProgressEntries;

    const completedLessons = lessonProgressEntries.filter(([, lp]) => lp.status === 'completed')
      .length;

    // Determine current lesson as most recently updated row
    const latest = rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
    const currentLessonId = latest?.lessonId;

    const overallPercentage = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    const payload: BackendCourseProgress = {
      courseId: id,
      userId: auth.userId,
      enrolledAt: new Date(),
      lastAccessedAt: latest ? latest.updatedAt : new Date(),
      status: 'in_progress',
      totalLessons,
      completedLessons,
      currentLessonId,
      lessonProgress: lessonMap as unknown as Map<string, BackendLessonProgress>,
      totalWatchTime: rows.reduce((sum, r) => sum + (r.watchTimeSeconds ?? 0), 0),
      estimatedTimeRemaining: 0,
      overallPercentage,
      moduleProgress: [],
      certificateEligible: false,
    };

    // Serialize Map → Array for transport
    const serialised = {
      ...payload,
      lessonProgress: Array.from(lessonProgressEntries),
    };

    return NextResponse.json({ data: serialised, error: null });
  } catch (err) {
    console.error('Failed to compute course progress', err);
    return createErrorResponse('Failed to fetch progress', 500);
  }
} 