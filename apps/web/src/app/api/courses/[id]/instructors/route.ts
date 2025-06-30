import { NextRequest, NextResponse } from 'next/server';
import { apiAuth, createErrorResponse, type AuthResult, checkCourseOwnership } from '@/lib/auth/api-auth';
import { instructorService } from '@/lib/server/services/instructors';
import type { ApiResponse } from '@/lib/shared/types/api';

/**
 * GET  /api/courses/[id]/instructors
 * List instructors attached to a course
 */
export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.pathname.split('/')[3]!;

  try {
    const instructors = await instructorService.getInstructorsByCourse(courseId);
    return NextResponse.json({ data: instructors, error: null } as ApiResponse<typeof instructors>);
  } catch (err) {
    const e = err as { message?: string; status?: number } | Error;
    return createErrorResponse(e.message || 'Failed to fetch instructors', (e as any).status || 500);
  }
}

/**
 * POST /api/courses/[id]/instructors
 * Body: { instructorId?: string, name?: string, title?: string, bio?: string, avatarUrl?: string, credentials?: string[] }
 * If instructorId provided, link existing instructor; otherwise create new one first.
 */
export async function POST(request: NextRequest) {
  const courseId = request.nextUrl.pathname.split('/')[3]!;
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    await checkCourseOwnership(courseId, auth.userId);
    const body = await request.json();

    let instructorId: string | undefined = body.instructorId;
    if (!instructorId) {
      const newInstructor = await instructorService.createInstructor({
        name: body.name,
        title: body.title,
        bio: body.bio,
        avatarUrl: body.avatarUrl,
        credentials: body.credentials,
        userId: null,
      });
      instructorId = newInstructor.id;
    }

    const pivot = await instructorService.linkInstructorToCourse({
      courseId,
      instructorId: instructorId!,
      role: body.role ?? 'co',
      sortOrder: body.sortOrder ?? 0,
      titleOverride: body.titleOverride ?? null,
    });

    return NextResponse.json({ data: pivot, error: null } as ApiResponse<typeof pivot>);
  } catch (err) {
    const e = err as { message?: string; status?: number } | Error;
    return createErrorResponse(e.message || 'Failed to add instructor', (e as any).status || 500);
  }
}

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
} 