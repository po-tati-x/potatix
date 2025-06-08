import { NextRequest, NextResponse } from "next/server";
import { db, authSchema } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";

// Standardized response helpers
const errorResponse = (message: string, status: number) => 
  NextResponse.json({ error: message }, { status });

// User sanitizer to prevent leaking sensitive data
const sanitizeUser = (user: typeof authSchema.user.$inferSelect) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  image: user.image
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }
    
    const users = await db.select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, session.user.id))
      .limit(1);
    
    if (!users.length) {
      return errorResponse("User not found", 404);
    }
    
    return NextResponse.json(sanitizeUser(users[0]));
  } catch (error) {
    console.error("Profile fetch error:", error);
    return errorResponse("Server error", 500);
  }
} 