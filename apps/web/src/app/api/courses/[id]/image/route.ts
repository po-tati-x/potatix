import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { apiAuth, createErrorResponse, type AuthResult, checkCourseOwnership } from "@/lib/auth/api-auth";
import type { ApiResponse } from "@/lib/shared/types/api";
import { uploadFile, deleteFile, extractKeyFromUrl } from "@/lib/server/utils/r2-client";
import { courseService } from "@/lib/server/services/courses";

// ---------------------- Helpers ----------------------
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return "userId" in auth && typeof auth.userId === "string";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ----------------------- POST ------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courseId } = await params;

  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  // Check ownership (throws if not owned)
  try {
    await checkCourseOwnership(courseId, auth.userId);
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number } | Error;
    return createErrorResponse(
      'message' in err && err.message ? err.message : 'Access denied',
      'status' in err && err.status ? err.status : 403,
    );
  }

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | undefined;

    if (!file) {
      return createErrorResponse("No file provided", 400);
    }

    // Validate size & type
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse("File too large (max 5MB)", 400);
    }

    if (!file.type.startsWith("image/")) {
      return createErrorResponse("Only image files are allowed", 400);
    }

    // Validate extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!allowedExtensions.includes(fileExtension)) {
      return createErrorResponse("Invalid file format", 400);
    }

    // Fetch course to get existing image
    const course = await courseService.getCourseById(courseId);
    if (!course) {
      return createErrorResponse("Course not found", 404);
    }

    // Delete old image if exists
    if (course.imageUrl) {
      try {
        const key = extractKeyFromUrl(course.imageUrl);
        if (key) await deleteFile(key);
      } catch (error) {
        console.error("[API] Failed to delete old course image:", error);
        // Swallow error – not fatal
      }
    }

    // Generate key & upload new image
    const key = `course/${courseId}/cover/${nanoid()}.${fileExtension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadFile(buffer, key, file.type);

    // Update course record
    await courseService.updateCourse(courseId, { imageUrl });

    // Return consistent ApiResponse
    const result = { imageUrl };
    return NextResponse.json({ data: result } as ApiResponse<typeof result>);
  } catch (error) {
    console.error("[API] Failed to upload course image:", error);
    return createErrorResponse("Failed to upload course image", 500);
  }
} 