import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { enrollmentService } from "@/lib/server/services/enrollments";

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

  const auth = await apiAuth(request);
  if (!hasUserId(auth)) return createErrorResponse(auth.error, auth.status);

  const course = await courseService.getCourseBySlug(slug, true);
  if (!course) return createErrorResponse("Course not found", 404);

  const result = await enrollmentService.checkEnrollment(auth.userId, course.id!);
  return NextResponse.json({ isEnrolled: result.enrolled, enrollment: result.enrollment ?? null });
}

/**
 * POST /api/courses/enrollment { courseSlug }
 * Creates an enrollment request / activates enrollment for current user
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const slug: string | undefined = body.courseSlug || body.slug;
  if (!slug) return createErrorResponse("courseSlug is required", 400);

  const auth = await apiAuth(request);
  if (!hasUserId(auth)) return createErrorResponse(auth.error, auth.status);

  const course = await courseService.getCourseBySlug(slug, true);
  if (!course) return createErrorResponse("Course not found", 404);

  const { enrollment, alreadyEnrolled } = await enrollmentService.createEnrollment({
    userId: auth.userId,
    courseId: course.id!,
  });

  return NextResponse.json({ alreadyEnrolled, enrollment }, { status: 201 });
} 