import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth-server";
import { courseService } from "@/lib/server/services/courses";
import { lessonService } from "@/lib/server/services/lessons";

export type AuthResult = {
  userId: string;
  error?: never;
  status?: never;
} | {
  userId?: never;
  error: string;
  status: number;
};

/**
 * Middleware for authenticating API routes
 * @param request NextRequest object
 * @returns AuthResult with userId or error details
 */
export async function apiAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get session using Better Auth's API
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session || !session.user) {
      return {
        error: "Authentication required",
        status: 401,
      };
    }
    
    return {
      userId: session.user.id,
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    const message = error instanceof Error ? error.message : "Authentication failed";
    return {
      error: message,
      status: 500,
    };
  }
}

/**
 * Helper to create a standardized error response
 */
export function createErrorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

/**
 * Helper function to check course ownership
 * Returns the course if owned, or throws an error with status code if not
 */
export async function checkCourseOwnership(courseId: string, userId: string) {
  const ownershipCheck = await courseService.checkCourseOwnership(courseId, userId);
  
  if (!ownershipCheck.owned) {
    // The service returns the error details as an object { error, status }
    const err = ownershipCheck.error as { error: string; status: number } | null;
    throw {
      message: (err?.error ?? "Access denied"),
      status: (err?.status ?? 403),
    };
  }
  
  return ownershipCheck.course;
}

/**
 * Helper function to check lesson ownership
 * Returns the lesson if owned, or throws an error with status code if not
 */
export async function checkLessonOwnership(lessonId: string, courseId: string, userId: string) {
  const ownershipCheck = await lessonService.checkLessonOwnership(lessonId, courseId, userId);
  
  if (!ownershipCheck.owned) {
    throw { 
      message: ownershipCheck.error || "Access denied", 
      status: ownershipCheck.status || 403 
    };
  }
  
  return ownershipCheck.lesson;
} 