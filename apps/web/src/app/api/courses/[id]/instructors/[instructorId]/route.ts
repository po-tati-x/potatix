import { NextRequest, NextResponse } from 'next/server';
import {
  apiAuth,
  createErrorResponse,
  type AuthResult,
  checkCourseOwnership,
} from '@/lib/auth/api-auth';
import { instructorService } from '@/lib/server/services/instructors';
import type { ApiResponse } from '@/lib/shared/types/api';
import { z } from 'zod';

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation schema for PATCH body – all fields optional
// ─────────────────────────────────────────────────────────────────────────────

const patchSchema = z.object({
  // Instructor profile fields
  name: z.string().trim().optional(),
  title: z.string().trim().optional(), // allow empty string for removal
  bio: z.string().trim().optional(),
  credentials: z.array(z.string().trim()).optional(),

  // Pivot fields
  titleOverride: z.string().trim().optional(),
  role: z.enum(['primary', 'co', 'guest']).optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * PATCH /api/courses/[courseId]/instructors/[instructorId]
 * Updates the instructor profile (name, title, bio, credentials) and/or pivot fields (titleOverride, role, sortOrder)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instructorId: string }> },
) {
  const { id: courseId, instructorId } = await params;

  // Auth & ownership check
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    await checkCourseOwnership(courseId, auth.userId);

    const body = patchSchema.parse(await request.json());

    const { name, title, bio, credentials, titleOverride, role, sortOrder } = body;

    // Collect instructor field updates
    const instructorUpdates: Record<string, unknown> = {};
    if (name !== undefined) instructorUpdates.name = name;
    if (title !== undefined) instructorUpdates.title = title;
    if (bio !== undefined) instructorUpdates.bio = bio;
    if (credentials !== undefined) instructorUpdates.credentials = credentials;

    if (Object.keys(instructorUpdates).length > 0) {
      await instructorService.updateInstructor(instructorId, instructorUpdates);
    }

    // Collect pivot table updates
    const pivotUpdates: Record<string, unknown> = {};
    if (titleOverride !== undefined) pivotUpdates.titleOverride = titleOverride;
    if (role !== undefined) pivotUpdates.role = role;
    if (sortOrder !== undefined) pivotUpdates.sortOrder = sortOrder;

    if (Object.keys(pivotUpdates).length > 0) {
      await instructorService.updateCourseInstructorByKeys(courseId, instructorId, pivotUpdates);
    }

    const updated = await instructorService.getInstructorsByCourse(courseId);

    return NextResponse.json({ data: updated } as ApiResponse<typeof updated>);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update instructor';
    const status =
      typeof error === 'object' && error !== null && 'status' in error && typeof (error as { status: unknown }).status === 'number'
        ? (error as { status: number }).status
        : 500;
    return createErrorResponse(message, status);
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
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    await checkCourseOwnership(courseId, auth.userId);

    await instructorService.unlinkInstructorFromCourse(courseId, instructorId);

    return NextResponse.json({ data: true } as ApiResponse<boolean>);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove instructor';
    const status =
      typeof error === 'object' && error !== null && 'status' in error && typeof (error as { status: unknown }).status === 'number'
        ? (error as { status: number }).status
        : 500;
    return createErrorResponse(message, status);
  }
} 