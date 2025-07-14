import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import type { Course } from "@/lib/shared/types/courses";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/courses/outline/[slug]
 * Returns lightweight course outline (modules + lesson summaries) for sidebar.
 * Public by default; use ?includeUnpublished=true to access drafts (requires auth implemented upstream).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const { searchParams } = new URL(request.url);
  const includeUnpublished = searchParams.get("includeUnpublished") === "true";
  try {
    const result = (await courseService.getCourseOutlineBySlug(
      slug,
      !includeUnpublished,
    )) as unknown;

    if (!result) {
      return createErrorResponse("Course not found", 404);
    }

    const outline = result as Course;

    return NextResponse.json({ data: outline });
  } catch (error) {
    console.error("[API] course outline", error);
    return createErrorResponse("Failed to fetch course outline", 500);
  }
} 