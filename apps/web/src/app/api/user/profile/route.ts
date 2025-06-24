import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse } from "@/lib/auth/api-auth";
import type { AuthResult } from "@/lib/auth/api-auth";
import { userService } from "@/lib/server/services/user";
import type { ApiResponse } from "@/lib/shared/types/api";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * GET /api/user/profile
 * Get user profile
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get user profile
    const profile = await userService.getUserProfile(auth.userId);
    
    if (!profile) {
      return createErrorResponse("User profile not found", 404);
    }
    
    return NextResponse.json({ data: profile, error: null } as ApiResponse<typeof profile>);
  } catch (error) {
    console.error("[API] Failed to get user profile:", error);
    return createErrorResponse("Failed to fetch profile", 500);
  }
}

/**
 * PATCH /api/user/profile
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Create update input (only allowing name and bio updates)
    const updateInput = {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.bio !== undefined ? { bio: body.bio } : {}),
    };
    
    // Update profile
    const updatedProfile = await userService.updateProfile(auth.userId, updateInput);
    
    return NextResponse.json({ data: updatedProfile, error: null } as ApiResponse<typeof updatedProfile>);
  } catch (error) {
    console.error("[API] Failed to update user profile:", error);
    return createErrorResponse("Failed to update profile", 500);
  }
} 