import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { z } from "zod";
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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return;
    }

    return session.user;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return;
  }
}

const bodySchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
});

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
    const { lessonId } = bodySchema.parse(await request.json());

    // Create a direct upload URL
    const upload = await mux.video.uploads.create({
      cors_origin: env.NEXT_PUBLIC_APP_URL || "*",
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: "basic",
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
      const { database, courseSchema } = await import('@potatix/db');
      const { eq } = await import('drizzle-orm');
      if (database) {
        await database
          .update(courseSchema.lesson)
          .set({
            directUploadId: String(upload.id),
            uploadStatus: 'PENDING',
          })
          .where(eq(courseSchema.lesson.id, lessonId));
      }
    } catch (error) {
      console.error('[Mux Upload] Failed to store direct upload ID', error);
    }

    return NextResponse.json({
      url: String(upload.url),
      id: String(upload.id),
    });
  } catch (error) {
    console.error("Error creating Mux upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 },
    );
  }
}
