import { NextRequest, NextResponse } from "next/server";
import { fetchMuxTranscript } from "@/lib/server/utils/mux";
import { database, lesson as lessonTable } from "@potatix/db";
import { eq } from "drizzle-orm";
import { generateChaptersFromTranscript } from '@/lib/server/services/ai';

export const dynamic = "force-dynamic";

// Convert timestamp format to seconds
function convertTimeToSeconds(timeString: string): number {
  const [hours = 0, minutes = 0, seconds = 0] = timeString
    .split(":")
    .map((part) => Number.parseFloat(part));

  return hours * 3600 + minutes * 60 + seconds;
}

// use singleton `database` directly from the DB package

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playbackId = searchParams.get("playbackId");
    const lessonId = searchParams.get("lessonId");

    if (!playbackId) {
      return NextResponse.json(
        { error: "Missing playbackId parameter" },
        { status: 400 },
      );
    }

    // Check if we already have transcriptData in the DB when lessonId is provided
    if (lessonId) {
      const existingLesson = await database
        .select()
        .from(lessonTable)
        .where(eq(lessonTable.id, lessonId))
        .then((rows) => rows[0]);

      if (existingLesson?.transcriptData) {
        console.log(`Using cached transcriptData for lesson ${lessonId}`);
        return NextResponse.json(existingLesson.transcriptData);
      }
    }

    // Get the transcript from Mux
    const { transcript: vttContent, error: transcriptError } =
      await fetchMuxTranscript(playbackId);

    if (transcriptError || !vttContent) {
      return NextResponse.json(
        { error: transcriptError || "No transcript available for this video" },
        { status: 404 },
      );
    }

    // Extract timestamps and text from WEBVTT in a format that preserves structure better
    interface TranscriptSegment {
      startTime: number;
      text: string;
    }

    const segments: TranscriptSegment[] = [];
    const lines = vttContent.split("\n");
    const timeRegex =
      /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;

    let currentSegment: TranscriptSegment | undefined;

    for (const line of lines) {
      const match = line.match(timeRegex);

      if (match) {
        // New timestamp found, create new segment
        const startTime = match[1] ?? "00:00:00.000";
        const seconds = convertTimeToSeconds(startTime);

        if (currentSegment && currentSegment.text.trim()) {
          segments.push(currentSegment);
        }

        currentSegment = {
          startTime: seconds,
          text: "",
        };
      } else if (currentSegment && line.trim()) {
        // Add text to current segment
        if (currentSegment.text) {
          currentSegment.text += " " + line.trim();
        } else {
          currentSegment.text = line.trim();
        }
      }
    }

    // Add the last segment if exists
    if (currentSegment && currentSegment.text.trim()) {
      segments.push(currentSegment);
    }

    // Create a better structured transcript for Gemini
    const structuredTranscript = segments
      .map(
        (seg) =>
          `[${Math.floor(seg.startTime / 60)}:${(seg.startTime % 60).toString().padStart(2, "0")}] ${seg.text}`,
      )
      .join("\n\n");

    // Get video duration
    const duration =
      segments.length > 0
        ? Math.max(...segments.map((s) => s.startTime)) + 30 // Add 30s to estimate end
        : 0;

    // Process with Gemini
    try {
      const chaptersRaw = await generateChaptersFromTranscript(structuredTranscript.slice(0, 100_000));

      interface Chapter {
        id: string;
        title: string;
        description: string;
        timestamp: number;
      }

      const finalChapters: Chapter[] = (chaptersRaw as unknown as Omit<Chapter, 'id'>[]).map((c, idx) => ({
        ...c,
        id: (idx + 1).toString(),
      }));

      const responseData = {
        chapters: finalChapters,
        textLength: structuredTranscript.length,
        duration,
        processedAt: new Date().toISOString(),
      };

      if (lessonId) {
        try {
          await database
            .update(lessonTable)
            .set({ transcriptData: responseData, updatedAt: new Date() })
            .where(eq(lessonTable.id, lessonId));
        } catch (error) {
          console.error('Failed to update lesson transcript data:', error);
        }
      }

      return NextResponse.json(responseData);
    } catch (error) {
      console.error('AI processing failed:', error);
      return NextResponse.json({ error: 'AI_FAILURE' }, { status: 422 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
