import { NextRequest, NextResponse } from "next/server";
import { fetchMuxTranscript } from "@/lib/utils/mux";
import { GoogleGenAI } from "@google/genai";
import { db, lesson as lessonTable } from "@potatix/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Convert timestamp format to seconds
function convertTimeToSeconds(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":").map(parseFloat);
  return hours * 3600 + minutes * 60 + seconds;
}

// Define type for processed chapter data
interface ChapterData {
  id: string;
  title: string;
  description: string;
  timestamp: number;
}

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
      const existingLesson = await db
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

    let currentSegment: TranscriptSegment | null = null;

    for (const line of lines) {
      const match = line.match(timeRegex);

      if (match) {
        // New timestamp found, create new segment
        const startTime = match[1];
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
      // Initialize the Gemini API client
      const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
      });

      // Set up model
      const model = ai.models.generateContentStream;

      // Prepare the prompt - ask for direct JSON output
      const promptText = `
You are a video transcript analyzer for a chess tutorial site. Analyze this chess video transcript and identify meaningful chapters.

CHESS VIDEO TRANSCRIPT:
"""
${structuredTranscript.substring(0, 100000)}
"""

IMPORTANT - RESPONSE MUST BE VALID JSON:
Return ONLY a JSON array of chapters, with the following structure:
{
  "id": "1",  // Chapter number as string, starting from 1
  "title": "Title of chapter",  // Short, descriptive title
  "description": "Detailed description",  // Longer description of the chapter content
  "timestamp": 0  // Timestamp in seconds where this chapter begins
}

Important instructions:
1. Create chapters at meaningful points in the content
2. Place timestamps at natural topic transitions
3. DO NOT use arbitrary timestamps
4. Use as many chapters as needed to properly segment the content - there is NO fixed number required
5. First chapter should always start at timestamp 0

No explanations, no extra text, ONLY the raw JSON array.
`;

      // Set up content for the model
      const contents = [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ];

      console.log("Sending request to Gemini API...");

      // Generate content
      const response = await model({
        model: "gemini-2.5-pro-preview-06-05",
        contents,
      });

      // Collect all chunks of text
      let fullResponse = "";
      for await (const chunk of response) {
        fullResponse += chunk.text || "";
      }

      console.log(`Raw Gemini response: ${fullResponse.substring(0, 100)}...`);

      // Clean up response in case there's any markdown code block formatting
      const jsonText = fullResponse.replace(/```json|```/g, "").trim();

      // Parse JSON
      const chapters = JSON.parse(jsonText);

      // Assign proper IDs to ensure they're sequential
      const finalChapters = chapters.map(
        (chapter: ChapterData, index: number) => ({
          ...chapter,
          id: (index + 1).toString(),
        }),
      );

      // Create response data object
      const responseData = {
        chapters: finalChapters,
        textLength: structuredTranscript.length,
        duration,
        processedAt: new Date().toISOString(),
      };

      // Update the lesson in the database if lessonId is provided
      if (lessonId) {
        try {
          await db
            .update(lessonTable)
            .set({
              transcriptData: responseData,
              updatedAt: new Date(),
            })
            .where(eq(lessonTable.id, lessonId));

          console.log(`Updated transcriptData for lesson ${lessonId}`);
        } catch (dbError) {
          console.error("Failed to update lesson transcript data:", dbError);
          // Continue execution - we'll still return the data even if DB update fails
        }
      }

      return NextResponse.json(responseData);
    } catch (error) {
      console.error("Error processing with Gemini:", error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Gemini API error",
          status: "AI_FAILURE",
        },
        { status: 422 },
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
