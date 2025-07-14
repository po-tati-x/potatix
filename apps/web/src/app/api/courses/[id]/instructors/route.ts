import { NextRequest, NextResponse } from 'next/server';
import { apiAuth, createErrorResponse, type AuthResult, checkCourseOwnership } from '@/lib/auth/api-auth';
import { instructorService } from '@/lib/server/services/instructors';
import type { ApiResponse } from '@/lib/shared/types/api';
import { z } from 'zod';

/**
 * GET  /api/courses/[id]/instructors
 * List instructors attached to a course
 */
export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.pathname.split('/')[3]!;

  try {
    const instructors = await instructorService.getInstructorsByCourse(courseId);
    return NextResponse.json({ data: instructors } as ApiResponse<typeof instructors>);
  } catch (error) {
    const e = error as { message?: string; status?: number };
    return createErrorResponse(e.message ?? 'Failed to fetch instructors', e.status ?? 500);
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
    const parsed = postSchema.parse(await request.json());

    let instructorId: string | undefined = parsed.instructorId;

    // Create new instructor when not linking an existing one
    if (!instructorId) {
      if (!parsed.name) {
        return createErrorResponse('Name is required to create a new instructor', 400);
      }

      const newInstructor = await instructorService.createInstructor({
        name: parsed.name,
        title: parsed.title,
        bio: parsed.bio,
        avatarUrl: parsed.avatarUrl,
        credentials: parsed.credentials,
      });
      instructorId = newInstructor.id;
    }

    const pivot = await instructorService.linkInstructorToCourse({
      courseId,
      instructorId,
      role: parsed.role ?? 'co',
      sortOrder: parsed.sortOrder ?? 0,
      titleOverride: parsed.titleOverride,
    });

    return NextResponse.json({ data: pivot } as ApiResponse<typeof pivot>, { status: 201 });
  } catch (error) {
    const e = error as { message?: string; status?: number };
    return createErrorResponse(e.message ?? 'Failed to add instructor', e.status ?? 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation schema for POST body – either `instructorId` or `name` required
// ─────────────────────────────────────────────────────────────────────────────

const postSchema = z.object({
  instructorId: z.string().trim().optional(),
  // New instructor fields (optional when linking existing)
  name: z.string().trim().optional(),
  title: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  avatarUrl: z.string().url().optional(),
  credentials: z.array(z.string().trim()).optional(),
  // Pivot fields
  role: z.enum(['primary', 'co', 'guest']).optional(),
  sortOrder: z.number().int().optional(),
  titleOverride: z.string().trim().optional(),
});

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
} 