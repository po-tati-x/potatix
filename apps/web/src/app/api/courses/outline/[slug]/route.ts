import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";

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
    const outline = await courseService.getCourseOutlineBySlug(slug, !includeUnpublished);
    if (!outline) {
      return createErrorResponse("Course not found", 404);
    }
    return NextResponse.json({ data: outline, error: null });
  } catch (err) {
    console.error("[API] course outline", err);
    return createErrorResponse("Failed to fetch course outline", 500);
  }
} 