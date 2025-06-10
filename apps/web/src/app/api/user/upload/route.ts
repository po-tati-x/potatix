import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth/auth";
import {
  uploadFile,
  deleteFile,
  extractKeyFromUrl,
} from "@/lib/utils/r2-client";
import { db, authSchema } from "@potatix/db";
import { eq } from "drizzle-orm";

// Max file size 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data with the file
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
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

    // Get file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 },
      );
    }

    // Generate a unique filename
    const fileName = `profile/${session.user.id}/${nanoid()}.${fileExtension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get the user to check if they already have a profile image
    const users = await db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, session.user.id))
      .limit(1);

    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = users[0];

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
      .where(eq(authSchema.user.id, session.user.id));

    // Return success response with the image URL
    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "Failed to upload profile image" },
      { status: 500 },
    );
  }
}

// DELETE endpoint to remove profile picture
export async function DELETE(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user to check if they have a profile image
    const users = await db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, session.user.id))
      .limit(1);

    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = users[0];

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
      .where(eq(authSchema.user.id, session.user.id));

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return NextResponse.json(
      { error: "Failed to delete profile image" },
      { status: 500 },
    );
  }
}
