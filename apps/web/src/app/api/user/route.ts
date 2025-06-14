import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, AuthResult } from "@/lib/auth/api-auth";
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
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Get user profile
    const profile = await userService.getUserProfile(auth.userId);
    
    if (!profile) {
      return createErrorResponse("User profile not found", 404);
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[API] Failed to get user profile:", error);
    return createErrorResponse("Failed to fetch profile", 500);
  }
}

/**
 * PATCH /api/user
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
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[API] Failed to update user profile:", error);
    return createErrorResponse("Failed to update profile", 500);
  }
}

/**
 * DELETE /api/user
 * Delete user account
 */
export async function DELETE(request: NextRequest) {
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Delete account
    await userService.deleteAccount(auth.userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete account:", error);
    return createErrorResponse("Failed to delete account", 500);
  }
} 