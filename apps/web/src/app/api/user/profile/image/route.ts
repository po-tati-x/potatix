import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { uploadFile, deleteFile, extractKeyFromUrl } from "@/lib/server/utils/r2-client";
import { db, authSchema } from "@potatix/db";
import { eq } from "drizzle-orm";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

// Max file size 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * POST /api/user/profile/image
 * Upload profile image
 */
export async function POST(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  if (!db) {
    return createErrorResponse("Database not initialized", 500);
  }
  
  try {
    // Get form data with the file
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createErrorResponse("No file provided", 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse("File too large (max 5MB)", 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return createErrorResponse("Only image files are allowed", 400);
    }

    // Get file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    if (!allowedExtensions.includes(fileExtension)) {
      return createErrorResponse("Invalid file format", 400);
    }

    // Generate a unique filename
    const fileName = `profile/${auth.userId}/${nanoid()}.${fileExtension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get the user to check if they already have a profile image
    const users = await db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, auth.userId))
      .limit(1);

    if (!users.length) {
      return createErrorResponse("User not found", 404);
    }

    const userData = users[0]!;

    // Delete old image if it exists
    if (userData.image) {
      try {
        const oldImageKey = extractKeyFromUrl(userData.image);
        if (oldImageKey) {
          await deleteFile(oldImageKey);
        }
      } catch (error) {
        console.error("Failed to delete old profile image:", error);
        // Continue even if delete fails
      }
    }

    // Upload the new image
    const imageUrl = await uploadFile(buffer, fileName, file.type);

    // Update user record with new image URL
    await db
      .update(authSchema.user)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(authSchema.user.id, auth.userId));

    // Return success response with the image URL
    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return createErrorResponse("Failed to upload profile image", 500);
  }
}

/**
 * DELETE /api/user/profile/image
 * Delete profile image
 */
export async function DELETE(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  if (!db) {
    return createErrorResponse("Database not initialized", 500);
  }
  
  try {
    // Get the user to check if they have a profile image
    const users = await db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, auth.userId))
      .limit(1);

    if (!users.length) {
      return createErrorResponse("User not found", 404);
    }

    const userData = users[0]!;

    // If no image, nothing to delete
    if (!userData.image) {
      return NextResponse.json({
        success: true,
        message: "No profile image to delete",
      });
    }

    // Delete image from storage
    const imageKey = extractKeyFromUrl(userData.image);
    if (imageKey) {
      await deleteFile(imageKey);
    }

    // Update user record to remove image reference
    await db
      .update(authSchema.user)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(authSchema.user.id, auth.userId));

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return createErrorResponse("Failed to delete profile image", 500);
  }
} 