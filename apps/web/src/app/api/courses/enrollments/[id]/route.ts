import { NextRequest, NextResponse } from "next/server";
import { apiAuth, createErrorResponse, type AuthResult } from "@/lib/auth/api-auth";
import { enrollmentService, type EnrollmentUpdateInput } from "@/lib/server/services/enrollments";
import { z } from "zod";

// Type guard to check if auth result has userId
function hasUserId(auth: AuthResult): auth is { userId: string } {
  return 'userId' in auth && typeof auth.userId === 'string';
}

/**
 * PATCH /api/courses/enrollments/[id]
 * Update enrollment status
 */
export async function PATCH(request: NextRequest) {
  const enrollmentId = request.nextUrl.pathname.split('/').pop() as string;
  
  // Authenticate user
  const auth = await apiAuth(request);
  if (!hasUserId(auth)) {
    return createErrorResponse(auth.error, auth.status);
  }
  
  try {
    // Validate request body
    const bodySchema = z.object({
      status: z.enum(["active", "pending", "rejected"]),
    });

    const { status } = bodySchema.parse(await request.json());
    
    // Create update input
    const updateInput: EnrollmentUpdateInput = {
      status,
    };
    
    // Update enrollment
    const result = await enrollmentService.updateEnrollment(enrollmentId, updateInput);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Failed to update enrollment:", error);
    return createErrorResponse("Failed to update enrollment", 500);
  }
} 