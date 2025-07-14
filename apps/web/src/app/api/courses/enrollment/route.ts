import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { enrollmentService } from "@/lib/server/services/enrollments";
import { z } from "zod";

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return "userId" in auth && typeof auth.userId === "string";
}

/**
 * GET /api/courses/enrollment?slug=course-slug
 * Returns enrollment state for current user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return createErrorResponse("slug param is required", 400);

  const auth: AuthResult = await apiAuth(request);
  if (!hasUserId(auth)) return createErrorResponse(auth.error, auth.status);

  const course = await courseService.getCourseBySlug(slug, true);
  if (!course) return createErrorResponse("Course not found", 404);

  const result = await enrollmentService.checkEnrollment(auth.userId, course.id);
  return NextResponse.json({
    isEnrolled: result.enrolled,
    // Use undefined instead of null per lint rule; client treats missing as none
    enrollment: result.enrollment ?? undefined,
  });
}

/**
 * POST /api/courses/enrollment { courseSlug }
 * Creates an enrollment request / activates enrollment for current user
 */
export async function POST(request: NextRequest) {
  // Validate body – allow { courseSlug } or { slug }
  const bodySchema = z.object({
    courseSlug: z.string().optional(),
    slug: z.string().optional(),
  });

  const body = bodySchema.parse(await request.json());
  const slug: string | undefined = body.courseSlug ?? body.slug;
  if (!slug) return createErrorResponse("courseSlug is required", 400);

  const auth: AuthResult = await apiAuth(request);
  if (!hasUserId(auth)) return createErrorResponse(auth.error, auth.status);

  const course = await courseService.getCourseBySlug(slug, true);
  if (!course) return createErrorResponse("Course not found", 404);

  const { enrollment, alreadyEnrolled } = await enrollmentService.createEnrollment({
    userId: auth.userId,
    courseId: course.id,
  });

  return NextResponse.json({ alreadyEnrolled, enrollment }, { status: 201 });
} 