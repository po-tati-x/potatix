import { NextRequest, NextResponse } from "next/server";
import { db } from "@potatix/db";
import { courseSchema } from "@potatix/db";
import { auth } from "@/lib/auth/auth";
import { eq, asc, and, count } from "drizzle-orm";
import { getMuxAssetId, deleteMuxAsset } from "@/lib/utils/mux";

// Define proper types for course and lesson
interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoId: string | null;
  order: number;
  moduleId: string;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  courseId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  lessons?: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string;
  imageUrl: string | null;
  userId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  slug?: string | null;
  lessons?: Lesson[];
  modules?: Module[];
  studentCount?: number;
}

// Type for the structured API response
type ApiResponse<T = Course> = {
  course?: T;
  error?: string;
  status?: number;
};

// Helper function to authenticate user and get course by ID
async function getCourseWithAuth(
  request: NextRequest,
  courseId: string,
): Promise<ApiResponse> {
  try {
    // Authenticate the user first
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      console.log("No session found for course retrieval");
      return { error: "Authentication required", status: 401 };
    }

    // Get course information
    const courses = await db
      .select({
        id: courseSchema.course.id,
        title: courseSchema.course.title,
        description: courseSchema.course.description,
        price: courseSchema.course.price,
        status: courseSchema.course.status,
        imageUrl: courseSchema.course.imageUrl,
        userId: courseSchema.course.userId,
        slug: courseSchema.course.slug,
        createdAt: courseSchema.course.createdAt,
        updatedAt: courseSchema.course.updatedAt,
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

    // Get student count for this course (active only)
    const enrollmentResult = await db
      .select({
        studentCount: count(),
      })
      .from(courseSchema.courseEnrollment)
      .where(
        and(
          eq(courseSchema.courseEnrollment.courseId, courseId),
          eq(courseSchema.courseEnrollment.status, "active"),
        ),
      );

    const studentCount = enrollmentResult[0]?.studentCount || 0;

    // Get modules for this course
    const modules = await db
      .select({
        id: courseSchema.courseModule.id,
        title: courseSchema.courseModule.title,
        description: courseSchema.courseModule.description,
        order: courseSchema.courseModule.order,
        courseId: courseSchema.courseModule.courseId,
        createdAt: courseSchema.courseModule.createdAt,
        updatedAt: courseSchema.courseModule.updatedAt,
      })
      .from(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.courseId, courseId))
      .orderBy(asc(courseSchema.courseModule.order));

    // Get lessons for this course
    const lessons = await db
      .select({
        id: courseSchema.lesson.id,
        title: courseSchema.lesson.title,
        description: courseSchema.lesson.description,
        videoId: courseSchema.lesson.videoId,
        uploadStatus: courseSchema.lesson.uploadStatus,
        order: courseSchema.lesson.order,
        moduleId: courseSchema.lesson.moduleId,
        courseId: courseSchema.lesson.courseId,
      })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, courseId))
      .orderBy(asc(courseSchema.lesson.order));

    // Debug logging for lesson video information
    console.log(
      `[API:GET:Course] Found ${lessons.length} lessons for course ${courseId}`,
    );
    lessons.forEach((lesson) => {
      console.log(
        `[API:GET:Course] Lesson ${lesson.id}: videoId=${lesson.videoId}, uploadStatus=${lesson.uploadStatus}`,
      );
    });

    // Group lessons by module
    const modulesWithLessons = modules.map((module) => {
      const moduleLessons = lessons.filter(
        (lesson) => lesson.moduleId === module.id,
      );

      return {
        ...module,
        lessons: moduleLessons.sort((a, b) => a.order - b.order),
      };
    });

    // Return the course with modules and lessons
    return {
      course: {
        ...course,
        modules: modulesWithLessons,
        lessons, // Keep flat lesson list for backward compatibility
        studentCount, // Add student count to the response
      },
    };
  } catch (error) {
    console.error("Error getting course:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get course";
    return { error: message, status: 500 };
  }
}

// GET handler to retrieve a single course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Get courseId from params
  const { id: courseId } = await params;

  console.log(`[API:GET:Course] Processing API request for course ${courseId}`);

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 },
    );
  }

  const result = await getCourseWithAuth(request, courseId);

  if (result.error && result.error) {
    console.log(
      `[API:GET:Course] Error retrieving course ${courseId}: ${result.error}`,
    );
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 500 },
    );
  }

  // Check if any lessons have videoId
  const videosFound =
    result.course?.lessons?.filter((l) => l.videoId).length || 0;
  console.log(
    `[API:GET:Course] Responding with course ${courseId}, found ${videosFound} lessons with videos`,
  );

  return NextResponse.json(result);
}

// PATCH handler to update a course
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Get courseId from params
  const { id: courseId } = await params;

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 },
    );
  }

  // First authenticate and get the course
  const courseCheck = await getCourseWithAuth(request, courseId);

  if (courseCheck.error && courseCheck.error) {
    return NextResponse.json(
      { error: courseCheck.error },
      { status: courseCheck.status || 500 },
    );
  }

  try {
    // Parse request body
    const body = await request.json();

    // Update the course
    await db
      .update(courseSchema.course)
      .set({
        title: body.title !== undefined ? body.title : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
        price: body.price !== undefined ? body.price : undefined,
        status: body.status !== undefined ? body.status : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        slug: body.slug !== undefined ? body.slug : undefined,
        updatedAt: new Date(),
      })
      .where(eq(courseSchema.course.id, courseId));

    // Get the updated course
    const updatedResult = await getCourseWithAuth(request, courseId);

    if (updatedResult.error && updatedResult.error) {
      return NextResponse.json(
        { error: updatedResult.error },
        { status: updatedResult.status || 500 },
      );
    }

    return NextResponse.json(updatedResult);
  } catch (error) {
    console.error("Failed to update course:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE handler to delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Get courseId from params
  const { id: courseId } = await params;

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 },
    );
  }

  // First authenticate and get the course
  const courseCheck = await getCourseWithAuth(request, courseId);

  if (courseCheck.error && courseCheck.error) {
    return NextResponse.json(
      { error: courseCheck.error },
      { status: courseCheck.status || 500 },
    );
  }

  try {
    // Get all lessons with videos first
    const lessonsWithVideos = await db
      .select({
        id: courseSchema.lesson.id,
        videoId: courseSchema.lesson.videoId,
      })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, courseId));

    console.log(
      `[API:DELETE:Course] Found ${lessonsWithVideos.length} lessons with potential videos to clean up`,
    );

    // Process videos deletion
    const videoResults = [];
    for (const lesson of lessonsWithVideos) {
      if (lesson.videoId) {
        console.log(
          `[API:DELETE:Course] Cleaning up Mux asset for lesson ${lesson.id} with playback ID ${lesson.videoId}`,
        );

        // Get asset ID from playback ID
        const assetId = await getMuxAssetId(lesson.videoId);

        if (assetId) {
          // Delete the Mux asset
          const deleted = await deleteMuxAsset(assetId);
          videoResults.push({
            lessonId: lesson.id,
            assetId,
            deleted,
          });
          console.log(
            `[API:DELETE:Course] Mux asset deletion for ${assetId}: ${deleted ? "Success" : "Failed"}`,
          );
        }
      }
    }

    // Delete lessons first (foreign key constraint)
    await db
      .delete(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, courseId));

    // Delete modules (foreign key constraint)
    await db
      .delete(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.courseId, courseId));

    // Then delete the course
    await db
      .delete(courseSchema.course)
      .where(eq(courseSchema.course.id, courseId));

    return NextResponse.json({
      success: true,
      videoCleanup: {
        total: lessonsWithVideos.filter((l) => l.videoId).length,
        deleted: videoResults.filter((r) => r.deleted).length,
        failed: videoResults.filter((r) => !r.deleted).length,
      },
    });
  } catch (error) {
    console.error("Failed to delete course:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
