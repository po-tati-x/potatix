import { NextRequest, NextResponse } from "next/server";
import { db } from "@potatix/db";
import { courseSchema } from "@potatix/db";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Lesson input validation schema
const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  videoId: z.string().optional().nullable(),
  order: z.number().int().min(0, "Order must be a non-negative number"),
  moduleId: z.string().min(1, "Module ID is required"),
});

// Type for the structured API response
type ApiResponse<T = Record<string, unknown>> = {
  id?: string;
  lesson?: T;
  error?: string;
  status?: number;
};

// Helper function to authenticate user and check course ownership
async function checkCourseOwnership(
  request: NextRequest,
  courseId: string,
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

    // Return the course ID if owner is valid
    return { id: course.id };
  } catch (error) {
    console.error("Error checking course ownership:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to validate course access";
    return { error: message, status: 500 };
  }
}

// Verify if moduleId exists in the database
async function verifyModuleExists(
  courseId: string,
  moduleId: string,
): Promise<boolean> {
  try {
    const modules = await db
      .select({ id: courseSchema.courseModule.id })
      .from(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.id, moduleId))
      .limit(1);

    console.log(
      `[DEBUG] Module verification: Searched for module ${moduleId} in course ${courseId}. Found: ${modules.length > 0}`,
    );
    return modules.length > 0;
  } catch (error) {
    console.error(`[DEBUG] Module verification error:`, error);
    return false;
  }
}

// POST handler to create a new lesson
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courseId } = await params;

  console.log(`[DEBUG] POST /api/courses/${courseId}/lessons - Starting...`);

  if (!courseId) {
    console.log("[DEBUG] Course ID is missing");
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 },
    );
  }

  // Check course ownership
  const ownershipCheck = await checkCourseOwnership(request, courseId);

  if (ownershipCheck.error) {
    console.log(
      `[DEBUG] Course ownership check failed: ${ownershipCheck.error}`,
    );
    return NextResponse.json(
      { error: ownershipCheck.error },
      { status: ownershipCheck.status || 500 },
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    console.log("[DEBUG] Request body:", body);

    // Validate lesson data
    const validationResult = lessonSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.format();
      console.error("[DEBUG] Validation failed:", errors);
      return NextResponse.json(
        { error: "Invalid lesson data", details: errors },
        { status: 400 },
      );
    }

    const lessonData = validationResult.data;

    // Verify if the module exists
    const moduleExists = await verifyModuleExists(
      courseId,
      lessonData.moduleId,
    );
    if (!moduleExists) {
      console.error(
        `[DEBUG] Module ${lessonData.moduleId} not found in course ${courseId}`,
      );
      return NextResponse.json(
        {
          error: `Module ${lessonData.moduleId} not found in course ${courseId}`,
        },
        { status: 404 },
      );
    }

    // Generate a unique ID for the lesson
    const lessonId = nanoid();

    console.log(
      `[DEBUG] Creating new lesson with ID: ${lessonId} for module: ${lessonData.moduleId}`,
    );

    // Insert the lesson
    const newLesson = await db
      .insert(courseSchema.lesson)
      .values({
        id: lessonId,
        title: lessonData.title,
        description: lessonData.description,
        videoId: lessonData.videoId,
        order: lessonData.order,
        moduleId: lessonData.moduleId,
        courseId: courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log(`[DEBUG] Lesson created:`, newLesson[0]);

    // Update lesson count in course using a separate query
    await db.execute(sql`
      UPDATE course
      SET "updatedAt" = NOW()
      WHERE id = ${courseId}
    `);

    return NextResponse.json({
      id: newLesson[0].id,
      message: "Lesson created successfully",
    });
  } catch (error) {
    console.error("[DEBUG] Failed to create lesson:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create lesson";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
