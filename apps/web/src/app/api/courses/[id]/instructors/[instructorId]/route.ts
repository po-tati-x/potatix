import { NextRequest, NextResponse } from 'next/server';
import { apiAuth, createErrorResponse, type AuthResult, checkCourseOwnership } from '@/lib/auth/api-auth';
import { instructorService } from '@/lib/server/services/instructors';
import type { ApiResponse } from '@/lib/shared/types/api';

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * PATCH /api/courses/[courseId]/instructors/[instructorId]
 * Updates the instructor profile (name, title, bio, credentials) and/or pivot fields (titleOverride, role, sortOrder)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instructorId: string }> },
) {
  const { id: courseId, instructorId } = await params;

  // Auth
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) return createErrorResponse(auth.error, auth.status);

  try {
    await checkCourseOwnership(courseId, auth.userId);

    const body = await request.json();

    // Update instructor profile if provided
    if (body.name || body.title || body.bio || body.credentials) {
      await instructorService.updateInstructor(instructorId, {
        name: body.name,
        title: body.title,
        bio: body.bio,
        credentials: body.credentials,
      });
    }

    // Update pivot if pivot fields supplied
    if (body.titleOverride !== undefined || body.role || body.sortOrder !== undefined) {
      await instructorService.updateCourseInstructorByKeys(courseId, instructorId, {
        titleOverride: body.titleOverride,
        role: body.role,
        sortOrder: body.sortOrder,
      });
    }

    const updated = await instructorService.getInstructorsByCourse(courseId);

    return NextResponse.json({ data: updated, error: null } as ApiResponse<typeof updated>);
  } catch (err) {
    const e = err as { message?: string; status?: number } | Error;
    return createErrorResponse(e.message || 'Failed to update instructor', (e as any).status || 500);
  }
}

/**
 * DELETE /api/courses/[courseId]/instructors/[instructorId]
 * Removes the pivot (does not delete instructor profile)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instructorId: string }> },
) {
  const { id: courseId, instructorId } = await params;

  const auth = await apiAuth(request);
  if (!hasUserId(auth)) return createErrorResponse(auth.error, auth.status);

  try {
    await checkCourseOwnership(courseId, auth.userId);

    await instructorService.unlinkInstructorFromCourse(courseId, instructorId);

    return NextResponse.json({ data: true, error: null } as ApiResponse<boolean>);
  } catch (err) {
    const e = err as { message?: string; status?: number } | Error;
    return createErrorResponse(e.message || 'Failed to remove instructor', (e as any).status || 500);
  }
} 