import { db, courseSchema } from "@potatix/db";
import { eq, and, count, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { slugify } from "../../shared/utils/courses";
import { getMuxAssetId, deleteMuxAsset } from "@/lib/server/utils/mux";
import { moduleService } from "./modules";
import { lessonService } from "./lessons";
import { logger } from "../utils/logger";

// Create a logger instance for courses
const courseLogger = logger.child("CourseService");

// Ensure singleton DB instance is initialized
const database = db!;

// Types
export interface CourseCreateInput {
  title: string;
  description?: string | null;
  price?: number;
  status?: string;
  imageUrl?: string | null;
  userId: string;
}

export interface CourseUpdateInput {
  title?: string;
  description?: string | null;
  price?: number;
  status?: string;
  imageUrl?: string | null;
  slug?: string;
}

// Course Service
export const courseService = {
  // Course operations
  async getCourseById(courseId: string) {
    try {
      const courses = await database
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

      return courses[0] || null;
    } catch (error) {
      courseLogger.error(
        `Failed to get course by ID: ${courseId}`,
        error as Error,
      );
      return null;
    }
  },

  async getCourseWithDetails(courseId: string) {
    try {
      // Fetch everything we need concurrently to avoid cumulative latency
      const [course, enrollmentResult, modules, lessons] = await Promise.all([
        this.getCourseById(courseId),
        database
          .select({ studentCount: count() })
          .from(courseSchema.courseEnrollment)
          .where(
            and(
              eq(courseSchema.courseEnrollment.courseId, courseId),
              eq(courseSchema.courseEnrollment.status, "active"),
            ),
          ),
        moduleService.getModulesByCourseId(courseId),
        lessonService.getLessonsByCourseId(courseId),
      ]);

      if (!course) return null;

      const studentCount = enrollmentResult[0]?.studentCount || 0;

      // Build modules array with nested lessons (sorted) in-memory once
      const modulesWithLessons = modules.map((module) => {
        const moduleLessons = lessons
          .filter((lesson) => lesson.moduleId === module.id)
          .sort((a, b) => a.order - b.order);

        return {
          ...module,
          createdAt: module.createdAt.toISOString(),
          updatedAt: module.updatedAt.toISOString(),
          lessons: moduleLessons.map((l) => ({
            ...l,
            description: l.description || undefined,
            createdAt: l.createdAt.toISOString(),
            updatedAt: l.updatedAt.toISOString(),
          })),
        };
      });

      return {
        ...course,
        // Normalise optional description to undefined for client convenience
        description: course.description || undefined,
        status: (course.status as 'draft' | 'published' | 'archived') ?? 'draft',
        // Convert dates only once – JSON.stringify will handle ISO conversion
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt?.toISOString(),
        modules: modulesWithLessons,
        lessons: lessons.map((l) => ({
          ...l,
          description: l.description || undefined,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        })),
        studentCount,
        lessonCount: lessons.length,
      } as const;
    } catch (error) {
      courseLogger.error(`Failed to get course details: ${courseId}`, error as Error);
      return null;
    }
  },

  async getCoursesByUserId(userId: string) {
    try {
      // Scalar sub-queries avoid the join-multiplication problem while keeping the
      // call single-round-trip.
      const resultRows = (
        await database.execute(sql/* sql */`
          SELECT
            c.id,
            c.title,
            c.description,
            c.price,
            c.status,
            c.image_url  AS "imageUrl",
            c.user_id    AS "userId",
            c.created_at AS "createdAt",
            c.updated_at AS "updatedAt",
            c.slug,
            /* counts */
            (
              SELECT COUNT(*)
              FROM lesson l
              WHERE l.course_id = c.id
            ) AS "lessonCount",
            (
              SELECT COUNT(*)
              FROM course_module m
              WHERE m.course_id = c.id
            ) AS "moduleCount",
            (
              SELECT COUNT(*)
              FROM course_enrollment e
              WHERE e.course_id = c.id
                AND e.status = 'active'
            ) AS "studentCount"
          FROM course c
          WHERE c.user_id = ${userId}
          ORDER BY c.updated_at DESC;
        `)
      ).rows as Array<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        status: string;
        imageUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date | null;
        slug: string | null;
        lessonCount: number;
        moduleCount: number;
        studentCount: number;
      }>;

      if (!resultRows.length) return [];

      return resultRows.map((course) => {
        const created = typeof course.createdAt === 'string'
          ? new Date(course.createdAt)
          : course.createdAt;
        const updated = course.updatedAt
          ? typeof course.updatedAt === 'string'
            ? new Date(course.updatedAt)
            : course.updatedAt
          : null;

        return {
          ...course,
          description: course.description || undefined,
          createdAt: created.toISOString(),
          updatedAt: updated?.toISOString(),
          status: (course.status as 'draft' | 'published' | 'archived') ?? 'draft',
        };
      });
    } catch (error) {
      courseLogger.error('Failed to get courses by user', error as Error);
      return [];
    }
  },

  async getCourseBySlug(slug: string, publishedOnly = true) {
    const query = publishedOnly
      ? and(
          eq(courseSchema.course.slug, slug),
          eq(courseSchema.course.status, "published"),
        )
      : eq(courseSchema.course.slug, slug);

    const courses = await database.select().from(courseSchema.course).where(query);

    if (!courses.length) return null;

    const course = courses[0]!;

    // Fetch modules
    const modules = await moduleService.getModulesByCourseId(course.id);

    // Fetch lessons
    const lessons = await lessonService.getLessonsByCourseId(course.id);

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

    return {
      ...course,
      modules: modulesWithLessons,
      lessons,
    };
  },

  async createCourse(data: CourseCreateInput) {
    try {
      const courseId = `course-${nanoid()}`;
      const slug = `${slugify(data.title)}-${nanoid(6)}`;

      // Create course
      await database.insert(courseSchema.course).values({
        id: courseId,
        title: data.title,
        description: data.description || null,
        price: data.price || 0,
        status: data.status || "draft",
        imageUrl: data.imageUrl || null,
        userId: data.userId,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Get the created course
      return await this.getCourseById(courseId);
    } catch (error) {
      courseLogger.error("Failed to create course", error as Error);
      return null;
    }
  },

  async updateCourse(courseId: string, data: CourseUpdateInput) {
    try {
      // If title has changed, generate a new slug
      let slug = data.slug;
      if (data.title && !data.slug) {
        slug = `${slugify(data.title)}-${nanoid(6)}`;
      }

      const updatedCourse = await database
        .update(courseSchema.course)
        .set({
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
          ...(slug ? { slug } : {}),
          updatedAt: new Date(),
        })
        .where(eq(courseSchema.course.id, courseId))
        .returning();

      return updatedCourse[0] || null;
    } catch (error) {
      courseLogger.error(
        `Failed to update course: ${courseId}`,
        error as Error,
      );
      return null;
    }
  },

  async deleteCourse(courseId: string) {
    try {
      // Get all lessons with videos first
      const lessonsWithVideos = await database
        .select({
          id: courseSchema.lesson.id,
          videoId: courseSchema.lesson.videoId,
        })
        .from(courseSchema.lesson)
        .where(eq(courseSchema.lesson.courseId, courseId));

      // Process videos deletion
      const videoResults = [];
      for (const lesson of lessonsWithVideos) {
        if (lesson.videoId) {
          const assetId = await getMuxAssetId(lesson.videoId);

          if (assetId) {
            const deleted = await deleteMuxAsset(assetId);
            videoResults.push({
              lessonId: lesson.id,
              assetId,
              deleted,
            });
          }
        }
      }

      // Delete lessons first (foreign key constraint)
      await database
        .delete(courseSchema.lesson)
        .where(eq(courseSchema.lesson.courseId, courseId));

      // Delete modules (foreign key constraint)
      await database
        .delete(courseSchema.courseModule)
        .where(eq(courseSchema.courseModule.courseId, courseId));

      // Then delete the course
      await database
        .delete(courseSchema.course)
        .where(eq(courseSchema.course.id, courseId));

      return {
        success: true,
        error: null,
        videoCleanup: {
          total: lessonsWithVideos.filter((l) => l.videoId).length,
          deleted: videoResults.filter((r) => r.deleted).length,
          failed: videoResults.filter((r) => !r.deleted).length,
        },
      };
    } catch (error) {
      courseLogger.error(
        `Failed to delete course: ${courseId}`,
        error as Error,
      );
      return {
        success: false,
        error: {
          error: "Failed to delete course",
          status: 500,
        },
      };
    }
  },

  async checkCourseOwnership(courseId: string, userId: string) {
    try {
      const courses = await database
        .select()
        .from(courseSchema.course)
        .where(
          and(
            eq(courseSchema.course.id, courseId),
            eq(courseSchema.course.userId, userId),
          ),
        )
        .limit(1);

      if (!courses.length) {
        return {
          owned: false,
          error: {
            error: "Course not found or not owned by user",
            status: 403,
          },
        };
      }

      return { owned: true, course: courses[0], error: null };
    } catch (error) {
      courseLogger.error(
        `Failed to check course ownership: ${courseId}`,
        error as Error,
      );
      return {
        owned: false,
        error: {
          error: "Failed to verify course ownership",
          status: 500,
        },
      };
    }
  },
};