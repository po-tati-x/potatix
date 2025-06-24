import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { courseService } from "@/lib/server/services/courses";
import { moduleService } from "@/lib/server/services/modules";
import { lessonService } from "@/lib/server/services/lessons";
import type { LessonCreateInput } from "@/lib/server/services/lessons";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/courses/lessons
 * Get lessons for a module or course
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  // Get courseId and moduleId from query params
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const moduleId = searchParams.get("moduleId");
  
  if (!courseId && !moduleId) {
    return createErrorResponse("Course ID or Module ID is required", 400);
  }
  
  try {
    let lessons;
    
    // If we have a courseId, check ownership and get all lessons for the course
    if (courseId) {
      // Check course ownership
      const ownershipCheck = await courseService.checkCourseOwnership(
        courseId,
        auth.userId
      );
      
      if (!ownershipCheck.owned) {
        const err = ownershipCheck.error ?? { error: "Access denied", status: 403 };
        return createErrorResponse(err.error, err.status);
      }
      
      // Get lessons for course
      lessons = await lessonService.getLessonsByCourseId(courseId);
    } 
    // If we have a moduleId, check ownership and get lessons for the module
    else if (moduleId) {
      // Get module to check course ownership
      const targetModule = await moduleService.getModuleById(moduleId);
      
      if (!targetModule) {
        return createErrorResponse("Module not found", 404);
      }
      
      // Check course ownership
      const ownershipCheck = await courseService.checkCourseOwnership(
        targetModule.courseId,
        auth.userId
      );
      
      if (!ownershipCheck.owned) {
        const err = ownershipCheck.error ?? { error: "Access denied", status: 403 };
        return createErrorResponse(err.error, err.status);
      }
      
      // Get lessons for module
      lessons = await lessonService.getLessonsByModuleId(moduleId);
    }
    
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("[API] Failed to get lessons:", error);
    return createErrorResponse(
      "Failed to fetch lessons", 
      500
    );
  }
}

/**
 * POST /api/courses/lessons
 * Create a new lesson
 */
export async function POST(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Parse request body
    const body = await request.json();
    const courseId = body.courseId;
    const moduleId = body.moduleId;
    
    if (!courseId || !moduleId) {
      return createErrorResponse("Course ID and Module ID are required", 400);
    }
    
    // Check course ownership
    const ownershipCheck = await courseService.checkCourseOwnership(
      courseId,
      auth.userId
    );
    
    if (!ownershipCheck.owned) {
      const err = ownershipCheck.error ?? { error: "Access denied", status: 403 };
      return createErrorResponse(err.error, err.status);
    }
    
    // Get lessons to determine order
    const existingLessons = await lessonService.getLessonsByModuleId(moduleId);
    const order = existingLessons.length;
    
    // Create lesson input
    const lessonInput: LessonCreateInput = {
      title: body.title,
      description: body.description,
      videoId: body.videoId,
      order,
      moduleId: moduleId,
      courseId: courseId,
    };
    
    // Create lesson
    const lesson = await lessonService.createLesson(lessonInput);
    
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create lesson:", error);
    return createErrorResponse(
      "Failed to create lesson", 
      500
    );
  }
} 