import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth/auth-server";
import { uploadFile } from "@/lib/server/utils/r2-client";

// Helper to authenticate user
async function authenticateUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return;
    }

    return session.user;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return;
  }
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    // Check if the request is multipart form data
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload directly
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 },
        );
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 },
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit" },
          { status: 400 },
        );
      }

      // Generate a unique file key
      const extension = file.type.split("/")[1];
      const uniqueId = nanoid();
      const key = `uploads/${user.id}/images/${uniqueId}.${extension}`;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to R2 using the utility function
      const fileUrl = await uploadFile(buffer, key, file.type);

      // Return the public URL
      return NextResponse.json({
        fileUrl,
        key,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
