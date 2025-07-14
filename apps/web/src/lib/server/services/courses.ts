import { database, courseSchema } from "@potatix/db";
import { eq, and, count, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getMuxAssetId, deleteMuxAsset } from "@/lib/server/utils/mux";
import { moduleService } from "./modules";
import { lessonService } from "./lessons";
import { instructorService } from "./instructors";
import { userService } from "./user";
import { logger } from "../utils/logger";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import type { Course } from "@/lib/shared/types/courses";
import { CourseModule, Lesson } from "@/lib/shared/types/courses";

// Lint-friendly helper – safely coerce unknown/nullish values, without `null` literals
const defined = <T>(value: T | undefined | null): T | undefined => (value === undefined ? undefined : (value as T));

// ────────────────────────────────────────────────────────────────────────────
// Shared helpers – defined once at module scope to satisfy lint rules
// ────────────────────────────────────────────────────────────────────────────

function toIso(date: string | Date | null | undefined): string {
  if (!date) return new Date(0).toISOString();
  return typeof date === 'string' ? date : date.toISOString();
}

function serializeLesson(raw: Lesson): Lesson {
  return {
    ...raw,
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
    ...(raw.description ? { description: raw.description } : {}),
    ...(raw.thumbnailUrl ? { thumbnailUrl: raw.thumbnailUrl } : {}),
  };
}

function serializeModule(raw: CourseModule & { lessons?: Lesson[] }): CourseModule & { lessons: Lesson[] } {
  return {
    ...raw,
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
    ...(raw.description ? { description: raw.description } : {}),
    lessons: (raw.lessons ?? []).map((l) => serializeLesson(l)).sort((a, b) => a.order - b.order),
  };
}

// Create a logger instance for courses
const courseLogger = logger.child("CourseService");

// Types
export interface CourseCreateInput {
  title: string;
  description?: string | undefined;
  price?: number;
  status?: string;
  imageUrl?: string | undefined;
  userId: string;
  perks?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
}

export interface CourseUpdateInput {
  title?: string;
  description?: string | undefined;
  price?: number;
  status?: string;
  imageUrl?: string | undefined;
  slug?: string;
  perks?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple in-memory cache for course lookups by slug. 30 s TTL.
// ─────────────────────────────────────────────────────────────────────────────
type CacheEntry = { data: unknown; expires: number };
// Generic map keyed by string, stores any payload — acceptable for ephemeral cache.
const slugCache = new Map<string, CacheEntry>();

// Helper – purge cached entries containing the given slug (both raw and outline)
function purgeSlugCache(slug: string) {
  // Two key shapes: `${slug}:${publishedOnly}` and `outline:${slug}:${publishedOnly}`
  const keysToDelete: string[] = [];
  for (const key of slugCache.keys()) {
    if (key.startsWith(`${slug}:`) || key.startsWith(`outline:${slug}:`)) {
      keysToDelete.push(key);
    }
  }
  for (const k of keysToDelete) slugCache.delete(k);
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
          perks: courseSchema.course.perks,
          learningOutcomes: courseSchema.course.learningOutcomes,
          prerequisites: courseSchema.course.prerequisites,
          userId: courseSchema.course.userId,
          slug: courseSchema.course.slug,
          createdAt: courseSchema.course.createdAt,
          updatedAt: courseSchema.course.updatedAt,
        })
        .from(courseSchema.course)
        .where(eq(courseSchema.course.id, courseId))
        .limit(1);

      return courses[0];
    } catch (error) {
      courseLogger.error(
        `Failed to get course by ID: ${courseId}`,
        error as Error,
      );
      return;
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

      if (!course) return;

      // Cast DB rows to shared types & derive counts
      const studentCount = enrollmentResult[0]?.studentCount ?? 0;
      const typedModules = modules as unknown as CourseModule[];
      const typedLessons = lessons as unknown as Lesson[];

      // Build modules with nested lessons (sorted)
      const modulesWithLessons = typedModules.map((mod) => {
        const modLessons = typedLessons
          .filter((lsn) => lsn.moduleId === mod.id)
          .sort((a, b) => a.order - b.order);
        return serializeModule({ ...mod, lessons: modLessons });
      });

      const detailedCourse: Course & {
        studentCount: number;
        lessonCount: number;
      } = {
        id: course.id,
        title: course.title,
        price: course.price,
        userId: course.userId,
        status: (course.status as 'draft' | 'published' | 'archived') ?? 'draft',
        createdAt: toIso(course.createdAt),
        updatedAt: course.updatedAt ? toIso(course.updatedAt) : toIso(new Date()),
        ...(course.description ? { description: course.description } : {}),
        ...(course.perks ? { perks: course.perks } : {}),
        ...(course.learningOutcomes ? { learningOutcomes: course.learningOutcomes } : {}),
        ...(course.prerequisites ? { prerequisites: course.prerequisites } : {}),
        ...(course.imageUrl ? { imageUrl: course.imageUrl } : {}),
        ...(course.slug ? { slug: course.slug } : {}),
        modules: modulesWithLessons,
        lessons: typedLessons.map((l) => serializeLesson(l)),
        studentCount,
        lessonCount: typedLessons.length,
      } as const;

      return detailedCourse;
    } catch (error) {
      courseLogger.error(`Failed to get course details: ${courseId}`, error as Error);
      return;
    }
  },

  async getCoursesByUserId(userId: string) {
    try {
      const rawResult = await database.execute(sql`
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
          c.perks,
          c.learning_outcomes AS "learningOutcomes",
          c.prerequisites,
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
      `);

      const resultRows = rawResult.rows as Array<{
        id: string;
        title: string;
        description: string | undefined;
        price: number;
        status: string;
        imageUrl: string | undefined;
        userId: string;
        createdAt: Date;
        updatedAt: Date | undefined;
        slug: string | undefined;
        perks: string[] | undefined;
        learningOutcomes: string[] | undefined;
        prerequisites: string[] | undefined;
        lessonCount: number;
        moduleCount: number;
        studentCount: number;
      }>;

      if (resultRows.length === 0) return [];

      return resultRows.map((row) => {
        const created = typeof row.createdAt === 'string' ? new Date(row.createdAt) : row.createdAt;
        const updated = row.updatedAt && typeof row.updatedAt === 'string' ? new Date(row.updatedAt) : row.updatedAt;

        return {
          ...row,
          ...(row.description ? { description: row.description } : {}),
          ...(row.perks ? { perks: row.perks } : {}),
          ...(row.learningOutcomes ? { learningOutcomes: row.learningOutcomes } : {}),
          ...(row.prerequisites ? { prerequisites: row.prerequisites } : {}),
          createdAt: created.toISOString(),
          ...(updated ? { updatedAt: updated.toISOString() } : {}),
          status: (row.status as 'draft' | 'published' | 'archived') ?? 'draft',
        };
      });
    } catch (error) {
      courseLogger.error('Failed to get courses by user', error as Error);
      return [];
    }
  },

  // (cache defined at module scope)

  async getCourseBySlug(slug: string, publishedOnly = true): Promise<Course | undefined> {
    // Skip cache when caller explicitly requests unpublished data (owner editing)
    const shouldUseCache = publishedOnly;

    const cacheKey = `${slug}:${publishedOnly}`;
    if (shouldUseCache) {
      const cached = slugCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data as Course;
      }
    }

    const query = publishedOnly
      ? and(
          eq(courseSchema.course.slug, slug),
          eq(courseSchema.course.status, "published"),
        )
      : eq(courseSchema.course.slug, slug);

    const courses = await database.select().from(courseSchema.course).where(query);

     if (courses.length === 0) return;

    const course = courses[0]!;

    // Fetch modules and lessons in parallel to avoid cumulative latency
    const [rawModules, rawLessons] = await Promise.all([
      moduleService.getModulesByCourseId(course.id),
      lessonService.getLessonsByCourseId(course.id),
    ]);

    // Cast raw DB rows to our shared types for safer access
    const modules = rawModules as unknown as CourseModule[];
    const lessons = rawLessons as unknown as Lesson[];

    // Group lessons by module
    const modulesWithLessons = modules.map((module) => {
      const moduleLessons = lessons
        .filter((lesson) => lesson.moduleId === module.id)
        .sort((a, b) => a.order - b.order);

      return { ...module, lessons: moduleLessons } satisfies CourseModule & { lessons: Lesson[] };
    });

    // (duplicate serializer definitions removed – now using module-level helpers)

    const baseCourse: Omit<Course, 'modules' | 'lessons'> = {
      id: course.id,
      title: course.title,
      status: (course.status as 'draft' | 'published' | 'archived') ?? 'draft',
      price: course.price,
      userId: course.userId,
      createdAt: toIso(course.createdAt),
      ...(course.description ? { description: course.description } : {}),
      ...(course.perks ? { perks: course.perks } : {}),
      ...(course.learningOutcomes ? { learningOutcomes: course.learningOutcomes } : {}),
      ...(course.prerequisites ? { prerequisites: course.prerequisites } : {}),
      ...(course.imageUrl ? { imageUrl: course.imageUrl } : {}),
      ...(course.slug ? { slug: course.slug } : {}),
      updatedAt: course.updatedAt ? toIso(course.updatedAt) : undefined,
    };

    const result: Course = {
      ...baseCourse,
      modules: modulesWithLessons.map((m) => serializeModule(m)),
      lessons: lessons.map((l) => serializeLesson(l)),
    };

    // Cache fresh result only when serving public content
    if (shouldUseCache) {
      slugCache.set(cacheKey, { data: result, expires: Date.now() + 30_000 });
    }
    return result;
  },

  /**
   * Lightweight outline (modules + lesson summaries) for sidebar.
   */
  async getCourseOutlineBySlug(slug: string, publishedOnly = true): Promise<Course | undefined> {
    const shouldUseCache = publishedOnly;

    const cacheKey = `outline:${slug}:${publishedOnly}`;
    if (shouldUseCache) {
      const cached = slugCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data as Course;
      }
    }

    const query = publishedOnly
      ? and(
          eq(courseSchema.course.slug, slug),
          eq(courseSchema.course.status, "published"),
        )
      : eq(courseSchema.course.slug, slug);

    const courses = await database.select().from(courseSchema.course).where(query);
    if (courses.length === 0) return;

    const course = courses[0]!;

    // Fetch in parallel: modules + lightweight lesson summaries
    const [rawModulesOutline, rawLessonSummaries] = await Promise.all([
      moduleService.getModulesByCourseId(course.id),
      lessonService.getLessonSummariesByCourseId(course.id),
    ]);

    // Normalise modules & lesson summaries for strict typing
    const outlineModules = rawModulesOutline.map((mod: unknown) => {
      const modLessons = (rawLessonSummaries as Lesson[])
        .filter((lsn) => lsn.moduleId === (mod as { id: string }).id)
        .sort((a, b) => a.order - b.order);

      return serializeModule({ ...(mod as CourseModule), lessons: modLessons });
    });

    const baseCourse: Omit<Course, 'modules' | 'lessons'> = {
      id: course.id,
      title: course.title,
      status: (course.status as 'draft' | 'published' | 'archived') ?? 'draft',
      price: course.price,
      userId: course.userId,
      createdAt: toIso(course.createdAt),
      updatedAt: course.updatedAt ? toIso(course.updatedAt) : undefined,
      ...(course.description ? { description: course.description } : {}),
      ...(course.perks ? { perks: course.perks } : {}),
      ...(course.learningOutcomes ? { learningOutcomes: course.learningOutcomes } : {}),
      ...(course.prerequisites ? { prerequisites: course.prerequisites } : {}),
      ...(course.imageUrl ? { imageUrl: course.imageUrl } : {}),
      ...(course.slug ? { slug: course.slug } : {}),
    };

    const outline: Course = {
      ...baseCourse,
      modules: outlineModules,
      lessons: outlineModules.flatMap((m) => m.lessons),
    };

    if (shouldUseCache) {
      slugCache.set(cacheKey, { data: outline, expires: Date.now() + 30_000 });
    }
    return outline;
  },

  async createCourse(data: CourseCreateInput) {
    try {
      const courseId = `course-${nanoid()}`;
      const slug = uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: "-",
        length: 2,
        style: "lowerCase",
      });

      // Create course
      await database.insert(courseSchema.course).values({
        id: courseId,
        title: data.title,
        ...(data.description === undefined ? {} : { description: defined(data.description) }),
        price: data.price || 0,
        status: data.status || "draft",
        ...(data.imageUrl === undefined ? {} : { imageUrl: defined(data.imageUrl) }),
        userId: data.userId,
        slug,
        perks: data.perks || [],
        learningOutcomes: data.learningOutcomes || [],
        prerequisites: data.prerequisites || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      /* -------------------------------------------------- */
      /*  Auto-attach creator as primary instructor          */
      /* -------------------------------------------------- */

      try {
        // 1. Resolve instructor row for this user (create if missing)
        let instructorId: string | undefined;

        const existing = await instructorService.getPublicInstructor(
          data.userId,
        );

        if (existing) {
          instructorId = existing.id;
        } else {
          // Fetch user profile for name / bio / avatar
          const profile = await userService.getUserProfile(data.userId);

          const newInstructor = await instructorService.createInstructor({
            name: profile.name ?? "Instructor",
            bio: profile.bio ?? undefined,
            avatarUrl: profile.image ?? undefined,
            userId: data.userId,
          });

          instructorId = newInstructor.id;
        }

        // 2. Link instructor to the new course as primary
        if (instructorId !== undefined) {
          await instructorService.linkInstructorToCourse({
            courseId,
            instructorId,
            role: "primary",
            sortOrder: 0,
          });
        }
      } catch (error) {
        courseLogger.warn(
          `Failed to attach instructor to course ${courseId}`,
          error as Error,
        );
      }

      // Get the created course
      return this.getCourseById(courseId);
    } catch (error) {
      courseLogger.error("Failed to create course", error as Error);
      return;
    }
  },

  async updateCourse(courseId: string, data: CourseUpdateInput) {
    try {
      // Preserve existing slug unless explicitly supplied
      const slug = data.slug;

      const updatedCourse = await database
        .update(courseSchema.course)
        .set({
          ...(data.title === undefined ? {} : { title: data.title }),
          ...(data.description === undefined
            ? {}
            : { description: defined(data.description) }),
          ...(data.price === undefined ? {} : { price: data.price }),
          ...(data.status === undefined ? {} : { status: data.status }),
          ...(data.imageUrl === undefined ? {} : { imageUrl: defined(data.imageUrl) }),
          ...(slug === undefined ? {} : { slug }),
          ...(data.perks === undefined ? {} : { perks: data.perks }),
          ...(data.learningOutcomes === undefined ? {} : { learningOutcomes: data.learningOutcomes }),
          ...(data.prerequisites === undefined ? {} : { prerequisites: data.prerequisites }),
          updatedAt: new Date(),
        })
        .where(eq(courseSchema.course.id, courseId))
        .returning();

      return updatedCourse[0];
    } catch (error) {
      courseLogger.error(
        `Failed to update course: ${courseId}`,
        error as Error,
      );
      return;
    }
  },

  /**
   * Invalidate in-memory slug cache after mutative operations (e.g. reordering).
   */
  invalidateSlugCache(slug: string) {
    purgeSlugCache(slug);
  },

  async deleteCourse(courseId: string) {
    try {
      // Get all lessons with videos first
      const lessonsWithVideos = await database
        .select({
          id: courseSchema.lesson.id,
          playbackId: courseSchema.lesson.playbackId,
        })
        .from(courseSchema.lesson)
        .where(eq(courseSchema.lesson.courseId, courseId));

      // Process videos deletion
      const videoResults = [];
      for (const lesson of lessonsWithVideos) {
        if (lesson.playbackId) {
          const assetId = await getMuxAssetId(lesson.playbackId);

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
        success: true as const,
        error: undefined,
        videoCleanup: {
          total: lessonsWithVideos.filter((l) => l.playbackId).length,
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
        success: false as const,
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

      if (courses.length === 0) {
        return {
          owned: false,
          error: {
            error: "Course not found or not owned by user",
            status: 403,
          },
        };
      }

      return { owned: true as const, course: courses[0] };
    } catch (error) {
      courseLogger.error(
        `Failed to check course ownership: ${courseId}`,
        error as Error,
      );
      return {
        owned: false as const,
        error: {
          error: "Failed to verify course ownership",
          status: 500,
        },
      };
    }
  },
};