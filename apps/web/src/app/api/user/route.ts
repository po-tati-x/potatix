import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { userService } from "@/lib/server/services/user";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/user
 * Get user profile
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);

  if (hasUserId(auth)) {
    try {
      // Get user profile
      const profile = await userService.getUserProfile(auth.userId);

      if (profile) {
        return NextResponse.json(profile);
      }

      return createErrorResponse("User profile not found", 404);
    } catch (error) {
      console.error("[API] Failed to get user profile:", error);
      return createErrorResponse("Failed to fetch profile", 500);
    }
  } else {
    return createErrorResponse(auth.error, auth.status);
  }
}

/**
 * PATCH /api/user
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);

  if (hasUserId(auth)) {
    try {
      // Validate and parse request body
      const patchSchema = z.object({
        name: z.string().min(1).max(120).optional(),
        bio: z.string().max(500).optional(),
      });

      const { name, bio } = patchSchema.parse(await request.json());

      const updateInput = {
        ...(typeof name === 'string' ? { name } : {}),
        ...(typeof bio === 'string' ? { bio } : {}),
      } as const;

      // Update profile
      const updatedProfile = await userService.updateProfile(auth.userId, updateInput);

      return NextResponse.json(updatedProfile);
    } catch (error) {
      console.error("[API] Failed to update user profile:", error);
      return createErrorResponse("Failed to update profile", 500);
    }
  }

  return createErrorResponse(auth.error, auth.status);
}

/**
 * DELETE /api/user
 * Delete user account
 */
export async function DELETE(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);

  if (hasUserId(auth)) {
    try {
      // Delete account
      await userService.deleteAccount(auth.userId);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[API] Failed to delete account:", error);
      return createErrorResponse("Failed to delete account", 500);
    }
  }

  return createErrorResponse(auth.error, auth.status);
} 