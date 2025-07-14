import { NextResponse } from "next/server";
import { database, courseSchema } from "@potatix/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

// Mux webhook handler
export async function POST(request: Request) {
  console.log(`[Mux Webhook] =========== START WEBHOOK PROCESSING ===========`);
  console.log(`[Mux Webhook] Request method: ${request.method}`);
  console.log(`[Mux Webhook] Request URL: ${request.url}`);

  try {
    // Get the webhook data
    console.log(`[Mux Webhook] Parsing request body...`);

    // Base validation for mux webhook payload
    const BaseEvent = z.object({
      type: z.string(),
      data: z.unknown(),
    });

    const { type, data } = BaseEvent.parse((await request.json()) as unknown);

    console.log(
      `[Mux Webhook] Received event: ${type}`,
      JSON.stringify(data).slice(0, 500),
    );

    // Ensure database instance is available
    if (!database) {
      console.error('[Mux Webhook] Database instance is null');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Debug SQL connection
    try {
      console.log(`[Mux Webhook] Testing database connection...`);
      const dbTest = (await database
        .select({ count: sql`count(*)` })
        .from(courseSchema.lesson)) as Array<{ count: bigint | number }>;
      const lessonCount = Number(dbTest[0]?.count ?? 0);
      console.log(
        `[Mux Webhook] Database connection successful, found ${lessonCount} lessons`,
      );
    } catch (error) {
      console.error(`[Mux Webhook] DATABASE CONNECTION TEST FAILED:`, error);
    }

    // Handle video.asset.ready event
    switch (type) {
    case "video.asset.ready": {
      // Strictly validate event payload
      const AssetReady = z.object({
        id: z.string(),
        playback_ids: z
          .array(z.object({ id: z.string() }))
          .optional(),
        aspect_ratio: z.string().optional(),
        max_stored_resolution: z
          .object({ width: z.number().optional(), height: z.number().optional() })
          .optional(),
        passthrough: z.string().optional(),
        duration: z.number().optional(),
      });

      const assetData = AssetReady.parse(data);

      const playbackId = assetData.playback_ids?.[0]?.id;
      const assetId = assetData.id;
      const aspectRatioNum = Number.parseFloat(assetData.aspect_ratio ?? 'NaN');
      const width = assetData.max_stored_resolution?.width;
      const height = assetData.max_stored_resolution?.height;

      // Parse passthrough JSON → { lessonId }
      const lessonId = (() => {
        if (!assetData.passthrough) return;
        const parsed = z
          .object({ lessonId: z.string() })
          .safeParse(JSON.parse(assetData.passthrough));
        if (parsed.success) return parsed.data.lessonId;
      })();

      if (!lessonId) {
        console.error(
          "[Mux Webhook] FATAL ERROR: No lesson ID in passthrough data",
          JSON.stringify(data).slice(0, 500),
        );
        return NextResponse.json(
          { error: "No lesson ID provided" },
          { status: 400 },
        );
      }

      if (!playbackId) {
        console.error("[Mux Webhook] FATAL ERROR: No playback ID available");
        return NextResponse.json(
          { error: "No playback ID available" },
          { status: 400 },
        );
      }

      console.log(
        `[Mux Webhook] Updating lesson ${lessonId} with video ID ${playbackId}`,
      );

      try {
        // Check if lesson exists - try both exact ID match and looking for a lesson with the client-side ID
        // This handles the case where client-side IDs don't match database IDs
        console.log(
          `[Mux Webhook] Checking if lesson ${lessonId} exists in database...`,
        );

        // First try direct ID match
        let lessonCheck = await database
          .select({
            id: courseSchema.lesson.id,
            title: courseSchema.lesson.title,
            playbackId: courseSchema.lesson.playbackId,
            uploadStatus: courseSchema.lesson.uploadStatus,
          })
          .from(courseSchema.lesson)
          .where(eq(courseSchema.lesson.id, lessonId));

        // If no direct match, we might need a more flexible approach
        if (lessonCheck.length === 0) {
          console.log(
            `[Mux Webhook] Direct ID match failed, looking for lessons with recent activity...`,
          );

          // Get all lessons with PROCESSING status
          const processingLessons = await database
            .select({
              id: courseSchema.lesson.id,
              title: courseSchema.lesson.title,
              playbackId: courseSchema.lesson.playbackId,
              uploadStatus: courseSchema.lesson.uploadStatus,
              updatedAt: courseSchema.lesson.updatedAt,
            })
            .from(courseSchema.lesson)
            .where(eq(courseSchema.lesson.uploadStatus, "PROCESSING"))
            .orderBy(sql`"updatedAt" DESC`);

          console.log(
            `[Mux Webhook] Found ${processingLessons.length} lessons with PROCESSING status`,
          );

          if (processingLessons.length > 0) {
            // Use the most recently updated lesson (pick first since ordered by updatedAt desc)
            const first = processingLessons[0]!;
            lessonCheck = [{
              id: first.id,
              title: first.title,
              playbackId: first.playbackId,
              uploadStatus: first.uploadStatus,
            }];
          }
        }

        if (lessonCheck.length === 0) {
          console.error(
            `[Mux Webhook] FATAL ERROR: Could not find a matching lesson for ID ${lessonId}`,
          );
          return NextResponse.json(
            { error: "Lesson not found" },
            { status: 404 },
          );
        }

        const targetLessonId = lessonCheck[0]!.id;
        console.log(
          `[Mux Webhook] Found lesson: ${targetLessonId}`,
          JSON.stringify(lessonCheck[0]),
        );

        // Update lesson with playbackId using raw SQL for better logging
        console.log(
          `[Mux Webhook] Executing SQL update for lesson ${targetLessonId}...`,
        );
        const updateResult = await database.execute(
          sql`
            UPDATE "lesson"
                          SET "playback_id" = ${playbackId},
                              "mux_asset_id" = ${assetId},
                              "aspect_ratio" = ${Number.isNaN(aspectRatioNum) ? undefined : aspectRatioNum},
                              "width" = ${width},
                              "height" = ${height},
                              "upload_status" = 'COMPLETED',
                              "duration" = ${Math.round(assetData.duration ?? 0)},
                              "poster_url" = ${`https://image.mux.com/${playbackId}/thumbnail.jpg`},
                              "updated_at" = NOW()
                          WHERE "id" = ${targetLessonId}
                          RETURNING "id", "playback_id", "upload_status", "updated_at"
          `,
        );

        const rowCount = updateResult.rowCount || 0;
        console.log(
          `[Mux Webhook] Updated ${rowCount} rows for lesson ${targetLessonId}`,
        );
        console.log(
          `[Mux Webhook] DB update result:`,
          JSON.stringify(updateResult.rows?.[0] || {}, undefined, 2),
        );

        if (rowCount === 0) {
          console.error(
            `[Mux Webhook] FATAL ERROR: Failed to update lesson ${targetLessonId}, no rows affected`,
          );
          return NextResponse.json(
            { error: "Failed to update lesson" },
            { status: 500 },
          );
        }

        // Verify the update worked
        console.log(
          `[Mux Webhook] Verifying update for lesson ${targetLessonId}...`,
        );
        const verifyUpdate = await database
          .select({
            id: courseSchema.lesson.id,
            playbackId: courseSchema.lesson.playbackId,
            uploadStatus: courseSchema.lesson.uploadStatus,
          })
          .from(courseSchema.lesson)
          .where(eq(courseSchema.lesson.id, targetLessonId));

        console.log(
          `[Mux Webhook] Verification after update:`,
          JSON.stringify(verifyUpdate[0]),
        );

        if (!verifyUpdate[0]?.playbackId) {
          console.error(
            `[Mux Webhook] FATAL ERROR: Update verification failed - playbackId not set`,
          );
        }
      } catch (dbError) {
        console.error("[Mux Webhook] Database error:", dbError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      console.log(
        `[Mux Webhook] Successfully updated lesson with video ID ${playbackId}`,
      );
    
    break;
    }
    case "video.upload.cancelled": {
      // Get lesson ID from passthrough data
      const UploadCancelled = z.object({
        new_asset_settings: z
          .object({ passthrough: z.string().optional() })
          .optional(),
      });
      const cancelledData = UploadCancelled.parse(data);

      const lessonId = (() => {
        const raw = cancelledData.new_asset_settings?.passthrough;
        if (!raw) return;
        const parsed = z
          .object({ lessonId: z.string() })
          .safeParse(JSON.parse(raw));
        if (parsed.success) return parsed.data.lessonId;
      })();

      if (lessonId) {
        // Update lesson to reset upload status using Drizzle
        await database
          .update(courseSchema.lesson)
          .set({
            uploadStatus: "CANCELLED",
          })
          .where(eq(courseSchema.lesson.id, lessonId));

        console.log(
          `[Mux Webhook] Marked lesson ${lessonId} upload as cancelled`,
        );
      }
    
    break;
    }
    case "video.upload.asset_created": {
      const AssetCreated = z.object({
        upload_id: z.string(),
        asset_id: z.string(),
      });
      const createdData = AssetCreated.parse(data);
      const directUploadId = createdData.upload_id;
      const assetId = createdData.asset_id;

      if (!directUploadId || !assetId) {
        console.error('[Mux Webhook] Missing IDs in asset_created');
      } else {
        await database
          .update(courseSchema.lesson)
          .set({ muxAssetId: assetId, uploadStatus: 'PROCESSING' })
          .where(eq(courseSchema.lesson.directUploadId, directUploadId));
        console.log(`[Mux Webhook] Linked direct upload ${directUploadId} -> asset ${assetId}`);
      }
    
    break;
    }
    // No default
    }

    // Return success
    console.log(
      `[Mux Webhook] =========== END WEBHOOK PROCESSING (SUCCESS) ===========`,
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Mux Webhook] FATAL ERROR processing webhook:", error);
    console.log(
      `[Mux Webhook] =========== END WEBHOOK PROCESSING (ERROR) ===========`,
    );
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
