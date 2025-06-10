import { NextRequest, NextResponse } from "next/server";
import { db, authSchema } from "@potatix/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";

// Define a proper interface for the profile update data
interface ProfileUpdateData {
  name: string;
  bio?: string | null;
  [key: string]: unknown; // Allow additional fields for form data flexibility
}

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body - handle both JSON and FormData
    let body: ProfileUpdateData = { name: "" };
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData for file uploads
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value as string;
      }
    } else {
      // Handle JSON for regular updates
      body = (await request.json()) as ProfileUpdateData;
    }

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if bio exceeds max length
    if (body.bio && body.bio.length > 160) {
      return NextResponse.json(
        { error: "Bio cannot exceed 160 characters" },
        { status: 400 },
      );
    }

    // Update the user record
    await db
      .update(authSchema.user)
      .set({
        name: body.name.trim(),
        bio: body.bio ? body.bio.trim() : null,
        updatedAt: new Date(),
      })
      .where(eq(authSchema.user.id, session.user.id));

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
