import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/courses/slug/[slug]
 * Get course by slug
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { slug } = await params;
  
  // Check if we need to include unpublished courses
  const { searchParams } = new URL(request.url);
  const includeUnpublished = searchParams.get("includeUnpublished") === "true";
  
  try {
    // If we need to include unpublished courses, authenticate user
    if (includeUnpublished) {
      const auth = await apiAuth(request);
      if (!hasUserId(auth)) {
        return createErrorResponse(auth.error, auth.status);
      }
    }
    
    // Get course by slug
    const course = await courseService.getCourseBySlug(slug, !includeUnpublished);
    
    if (!course) {
      return createErrorResponse("Course not found", 404);
    }
    
    // If including unpublished and the user isn't the owner, deny access
    if (includeUnpublished) {
      const auth = await apiAuth(request);
      if (hasUserId(auth) && course.userId !== auth.userId) {
        return createErrorResponse("Access denied", 403);
      }
    }
    
    return NextResponse.json({ data: course, error: null });
  } catch (error) {
    console.error("[API] Failed to get course by slug:", error);
    return createErrorResponse("Failed to fetch course", 500);
  }
} 