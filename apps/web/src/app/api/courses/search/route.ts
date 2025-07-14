import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { database, courseSchema } from "@potatix/db";
import { desc, sql } from "drizzle-orm";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses/search
 * Search for courses with filters
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse search parameters
  const query = searchParams.get("query") || "";
  const status = searchParams.get("status");
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
  const userOnly = searchParams.get("userOnly") === "true";
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  // If userOnly is true, we need to authenticate
  let userId: string | undefined;
  
  if (userOnly) {
    const auth = await apiAuth(request);
    if (!hasUserId(auth)) {
      return createErrorResponse(auth.error, auth.status);
    }
    userId = auth.userId;
  }
  
  try {
    // Default query to show only published courses
    let conditions = sql`${courseSchema.course.status} = 'published'`;
    
    // Override with specific status if provided
    if (status) {
      conditions = sql`${courseSchema.course.status} = ${status}`;
    }
    
    // Filter by user if userOnly is true
    if (userOnly && userId) {
      conditions = sql`${courseSchema.course.userId} = ${userId}`;
    }
    
    // Add search by title or description if query is provided
    if (query) {
      const searchCondition = sql`(${courseSchema.course.title} ILIKE ${'%' + query + '%'} OR ${courseSchema.course.description} ILIKE ${'%' + query + '%'})`;
      
      conditions = conditions ? sql`${conditions} AND ${searchCondition}` : searchCondition;
    }
    
    // Get total count
    const countQuery = database.select({ count: sql`COUNT(*)` })
      .from(courseSchema.course)
      .where(conditions);
    
    const countResult = await countQuery;
    const totalCount = Number(countResult[0]?.count || 0);
    
    // Get courses
    const coursesQuery = database.select({
      id: courseSchema.course.id,
      title: courseSchema.course.title,
      description: courseSchema.course.description,
      price: courseSchema.course.price,
      status: courseSchema.course.status,
      imageUrl: courseSchema.course.imageUrl,
      userId: courseSchema.course.userId,
      slug: courseSchema.course.slug,
      createdAt: courseSchema.course.createdAt,
      updatedAt: courseSchema.course.updatedAt,
    })
    .from(courseSchema.course)
    .where(conditions)
    .orderBy(desc(courseSchema.course.updatedAt))
    .limit(limit)
    .offset(offset);
    
    const courses = await coursesQuery;
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("[API] Failed to search courses:", error);
    return createErrorResponse("Failed to search courses", 500);
  }
} 