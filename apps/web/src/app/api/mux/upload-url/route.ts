import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-server";
import { env } from "@/env.server";

// Initialize Mux client
const mux = new Mux({
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
});

// Helper to authenticate user
async function authenticateUser(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get lesson ID from request body
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    // Create a direct upload URL
    const upload = await mux.video.uploads.create({
      cors_origin: env.NEXT_PUBLIC_APP_URL || "*",
      new_asset_settings: {
        playback_policy: ["public"],
        passthrough: JSON.stringify({ lessonId }),
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English CC",
              },
            ],
          },
        ],
      },
    });

    // Persist direct upload ID & reset lesson status
    try {
      // Lazy import to avoid circular deps in lambda edge
      const { db, courseSchema } = await import('@potatix/db');
      const { eq } = await import('drizzle-orm');
      if (db) {
        await db
          .update(courseSchema.lesson)
          .set({
            directUploadId: upload.id,
            uploadStatus: 'PENDING',
          })
          .where(eq(courseSchema.lesson.id, lessonId));
      }
    } catch (err) {
      console.error('[Mux Upload] Failed to store direct upload ID', err);
    }

    return NextResponse.json({
      url: upload.url,
      id: upload.id,
    });
  } catch (error) {
    console.error("Error creating Mux upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 },
    );
  }
}
