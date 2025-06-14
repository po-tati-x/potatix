import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, AuthResult } from "@/lib/auth/api-auth";
import { db as _db, courseSchema } from "@potatix/db";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/shared/utils/courses";
import { nanoid } from "nanoid";

const db = _db!;

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses/validate
 * Validate course data (title, slug, etc.)
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const value = searchParams.get("value");
  
  if (!type || !value) {
    return createErrorResponse("Type and value parameters are required", 400);
  }
  
  try {
    // Handle different validation types
    switch (type) {
      case "slug": {
        // Check if slug already exists
        const slug = value;
        
        const existingCourses = await db
          .select({ id: courseSchema.course.id })
          .from(courseSchema.course)
          .where(eq(courseSchema.course.slug, slug));
        
        const exists = existingCourses.length > 0;
        
        return NextResponse.json({
          valid: !exists,
          message: exists 
            ? "Slug already exists" 
            : "Slug is available",
          slug
        });
      }
      
      case "title": {
        // Generate a slug from title
        const title = value;
        const baseSlug = slugify(title);
        const uniqueSlug = `${baseSlug}-${nanoid(6)}`;
        
        return NextResponse.json({
          valid: true,
          message: "Generated slug from title",
          slug: uniqueSlug
        });
      }
      
      default:
        return createErrorResponse(
          `Unsupported validation type: ${type}`,
          400
        );
    }
  } catch (error) {
    console.error("[API] Validation error:", error);
    return createErrorResponse("Failed to validate", 500);
  }
} 