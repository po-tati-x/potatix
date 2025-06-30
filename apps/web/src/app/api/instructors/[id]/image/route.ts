import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import type { ApiResponse } from "@/lib/shared/types/api";
import { uploadFile } from "@/lib/server/utils/r2-client";
import { instructorService } from "@/lib/server/services/instructors";

function hasUserId(auth: AuthResult): auth is { userId: string } {
  return "userId" in auth && typeof auth.userId === "string";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: instructorId } = await params;

  // Auth only verifies logged-in users for now (no ownership check)
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return createErrorResponse("No file provided", 400);

    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse("File too large (max 5MB)", 400);
    }
    if (!file.type.startsWith("image/")) {
      return createErrorResponse("Only image files are allowed", 400);
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!allowedExtensions.includes(fileExtension)) {
      return createErrorResponse("Invalid file format", 400);
    }

    const key = `instructor/${instructorId}/avatar/${nanoid()}.${fileExtension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const avatarUrl = await uploadFile(buffer, key, file.type);

    await instructorService.updateInstructor(instructorId, { avatarUrl });

    const result = { avatarUrl };
    return NextResponse.json({ data: result, error: null } as ApiResponse<typeof result>);
  } catch (err) {
    console.error("[API] Failed to upload instructor avatar", err);
    return createErrorResponse("Failed to upload avatar", 500);
  }
} 