import { NextRequest, NextResponse } from "next/server";
import { db } from "@potatix/db";
import { courseSchema } from "@potatix/db";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getMuxAssetId, deleteMuxAsset } from "@/lib/utils/mux";

// Lesson update validation schema
const lessonUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  videoId: z.string().optional().nullable(),
  order: z
    .number()
    .int()
    .positive("Order must be a positive number")
    .optional(),
});

// Define lesson type for better type safety
interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  videoId: string | null;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  uploadStatus?: string | null;
  duration?: number | null;
  [key: string]: unknown; // For any other properties
}

// Type for the structured API response
type ApiResponse<T = Lesson> = {
  lesson?: T;
  error?: string;
  status?: number;
};

// Helper function to authenticate user and check lesson ownership
async function checkLessonOwnership(
  request: NextRequest,
  courseId: string,
  lessonId: string,
): Promise<ApiResponse> {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      console.log("No valid session found for lesson request");
      return { error: "Authentication required", status: 401 };
    }

    // Check if the course exists and belongs to the user
    const courses = await db
      .select({
        id: courseSchema.course.id,
        userId: courseSchema.course.userId,
      })
      .from(courseSchema.course)
      .where(eq(courseSchema.course.id, courseId))
      .limit(1);

    if (!courses.length) {
      return { error: "Course not found", status: 404 };
    }

    const course = courses[0];

    // Check if the user is the owner of this course
    if (course.userId !== session.user.id) {
      return { error: "Access denied", status: 403 };
    }

    // Check if the lesson exists and belongs to the course
    const lessons = await db
      .select()
      .from(courseSchema.lesson)
      .where(
        and(
          eq(courseSchema.lesson.id, lessonId),
          eq(courseSchema.lesson.courseId, courseId),
        ),
      )
      .limit(1);

    if (!lessons.length) {
      return { error: "Lesson not found", status: 404 };
    }

    // Return the lesson if all checks pass
    return { lesson: lessons[0] };
  } catch (error) {
    console.error("Error checking lesson ownership:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to validate lesson access";
    return { error: message, status: 500 };
  }
}

// GET handler to retrieve a single lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  const { id: courseId, lessonId } = await params;

  if (!courseId || !lessonId) {
    return NextResponse.json(
      { error: "Course ID and Lesson ID are required" },
      { status: 400 },
    );
  }

  // Check lesson ownership
  const ownershipCheck = await checkLessonOwnership(
    request,
    courseId,
    lessonId,
  );

  if (ownershipCheck.error) {
    return NextResponse.json(
      { error: ownershipCheck.error },
      { status: ownershipCheck.status || 500 },
    );
  }

  return NextResponse.json({ lesson: ownershipCheck.lesson });
}

// PATCH handler to update a lesson
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  const { id: courseId, lessonId } = await params;

  if (!courseId || !lessonId) {
    return NextResponse.json(
      { error: "Course ID and Lesson ID are required" },
      { status: 400 },
    );
  }

  // Check lesson ownership
  const ownershipCheck = await checkLessonOwnership(
    request,
    courseId,
    lessonId,
  );

  if (ownershipCheck.error) {
    return NextResponse.json(
      { error: ownershipCheck.error },
      { status: ownershipCheck.status || 500 },
    );
  }

  try {
    // Parse request body
    const body = await request.json();

    // Validate lesson data
    const validationResult = lessonUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        { error: "Invalid lesson data", details: errors },
        { status: 400 },
      );
    }

    const lessonData = validationResult.data;

    // Update the lesson
    const updatedLesson = await db
      .update(courseSchema.lesson)
      .set({
        ...lessonData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(courseSchema.lesson.id, lessonId),
          eq(courseSchema.lesson.courseId, courseId),
        ),
      )
      .returning();

    return NextResponse.json({
      lesson: updatedLesson[0],
      message: "Lesson updated successfully",
    });
  } catch (error) {
    console.error("Failed to update lesson:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update lesson";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE handler to delete a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  const { id: courseId, lessonId } = await params;

  if (!courseId || !lessonId) {
    return NextResponse.json(
      { error: "Course ID and Lesson ID are required" },
      { status: 400 },
    );
  }

  // Check lesson ownership
  const ownershipCheck = await checkLessonOwnership(
    request,
    courseId,
    lessonId,
  );

  if (ownershipCheck.error) {
    return NextResponse.json(
      { error: ownershipCheck.error },
      { status: ownershipCheck.status || 500 },
    );
  }

  const lesson = ownershipCheck.lesson as Lesson;
  let videoDeleted = false;

  try {
    // First attempt to delete the video if it exists
    if (lesson.videoId) {
      console.log(
        `Attempting to clean up Mux video asset for lesson ${lessonId} with playback ID ${lesson.videoId}`,
      );

      // Get asset ID from playback ID
      const assetId = await getMuxAssetId(lesson.videoId);

      if (assetId) {
        // Delete the Mux asset
        videoDeleted = await deleteMuxAsset(assetId);
        console.log(
          `Mux asset deletion result for ${assetId}: ${videoDeleted ? "Success" : "Failed"}`,
        );
      }
    }

    // Then delete the lesson from the database
    await db
      .delete(courseSchema.lesson)
      .where(
        and(
          eq(courseSchema.lesson.id, lessonId),
          eq(courseSchema.lesson.courseId, courseId),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully",
      videoDeleted: lesson.videoId ? videoDeleted : null,
    });
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete lesson";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
