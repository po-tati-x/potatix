import { NextResponse } from "next/server";
import { db, courseSchema } from "@potatix/db";
import { eq, and } from "drizzle-orm";

// GET /api/courses/slug/[slug]
// Public endpoint - doesn't require auth
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Get slug from params
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { error: "Course slug is required" },
      { status: 400 },
    );
  }

  try {
    console.log(`[API] Fetching course with slug: ${slug}`);

    // Find the course by slug, only return published courses
    const courses = await db
      .select()
      .from(courseSchema.course)
      .where(
        and(
          eq(courseSchema.course.slug, slug),
          eq(courseSchema.course.status, "published"),
        ),
      );

    const course = courses[0];

    if (!course) {
      console.log(
        `[API] Course with slug "${slug}" not found or not published`,
      );
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch modules for this course
    const modules = await db
      .select()
      .from(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.courseId, course.id))
      .orderBy(courseSchema.courseModule.order);

    // Fetch lessons for this course
    const lessons = await db
      .select()
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, course.id))
      .orderBy(courseSchema.lesson.order);

    // Group lessons by moduleId
    const moduleWithLessons = modules.map((module) => {
      const moduleLessons = lessons.filter(
        (lesson) => lesson.moduleId === module.id,
      );
      return {
        ...module,
        lessons: moduleLessons.sort((a, b) => a.order - b.order),
      };
    });

    // Combine course with modules and all lessons
    const courseWithModules = {
      ...course,
      modules: moduleWithLessons,
      // Keep flat lessons array for backwards compatibility
      lessons,
    };

    console.log(
      `[API] Found course: ${course.title} with ${modules.length} modules`,
    );
    return NextResponse.json({ course: courseWithModules });
  } catch (error) {
    console.error("Error fetching course by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}
