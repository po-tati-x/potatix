import { database, instructorSchema } from '@potatix/db';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Helper types
// ─────────────────────────────────────────────────────────────────────────────

interface CourseInstructorDbRow {
  id: string;
  role: 'primary' | 'co' | 'guest';
  sortOrder: number;
  titleOverride: string | undefined;
  instructorId: string;
  name: string;
  title: string | undefined;
  bio: string | undefined;
  avatarUrl: string | undefined;
  credentials: string[] | undefined;
  userId: string | undefined;
  totalStudents: number | string | undefined;
}

interface PublicInstructorDbRow {
  id: string;
  name: string;
  title: string | undefined;
  bio: string | undefined;
  avatarUrl: string | undefined;
  credentials: string[] | undefined;
  totalStudents: number | string | undefined;
}

const instructorLogger = logger.child('InstructorService');

export interface CreateInstructorInput {
  name: string;
  title?: string | undefined;
  bio?: string | undefined;
  avatarUrl?: string | undefined;
  credentials?: string[] | undefined;
  userId?: string | undefined;
}

export const instructorService = {
  /* -------------------------------------------------- */
  // Instructor CRUD
  /* -------------------------------------------------- */
  async createInstructor(data: CreateInstructorInput) {
    const id = nanoid();
    try {
      await database.insert(instructorSchema.instructor).values({
        id,
        name: data.name,
        title: data.title ?? undefined,
        bio: data.bio ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        credentials: data.credentials ?? [],
        userId: data.userId ?? undefined,
      });
      return {
        id,
        name: data.name,
        title: data.title ?? undefined,
        bio: data.bio ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        credentials: data.credentials ?? [],
        userId: data.userId ?? undefined,
      };
    } catch (error) {
      instructorLogger.error('Failed to create instructor', error as Error);
      throw error;
    }
  },

  async linkInstructorToCourse({
    courseId,
    instructorId,
    role = 'co',
    sortOrder = 0,
    titleOverride,
  }: {
    courseId: string;
    instructorId: string;
    role?: 'primary' | 'co' | 'guest';
    sortOrder?: number;
    titleOverride?: string | undefined;
  }) {
    const id = nanoid();
    try {
      await database.insert(instructorSchema.courseInstructor).values({
        id,
        courseId,
        instructorId,
        role,
        sortOrder,
        titleOverride,
      });
      return { id, courseId, instructorId, role, sortOrder, titleOverride };
    } catch (error) {
      instructorLogger.error('Failed to link instructor to course', error as Error);
      throw error;
    }
  },

  async unlinkInstructorFromCourse(courseId: string, instructorId: string) {
    try {
      const result = await database
        .delete(instructorSchema.courseInstructor)
        .where(
          and(
            eq(instructorSchema.courseInstructor.courseId, courseId),
            eq(instructorSchema.courseInstructor.instructorId, instructorId),
          ),
        );
      return result.rowCount ?? 0;
    } catch (error) {
      instructorLogger.error('Failed to unlink instructor', error as Error);
      throw error;
    }
  },

  async updateCourseInstructor(
    id: string,
    data: Partial<{
      role: 'primary' | 'co' | 'guest';
      sortOrder: number;
      titleOverride: string | undefined;
    }>,
  ) {
    try {
      const [row] = await database
        .update(instructorSchema.courseInstructor)
        .set(data)
        .where(eq(instructorSchema.courseInstructor.id, id))
        .returning();
      return row;
    } catch (error) {
      instructorLogger.error('Failed to update course instructor', error as Error);
      throw error;
    }
  },

  async getInstructorsByCourse(courseId: string) {
    try {
      const queryResult = await database.execute(sql/* sql */`
        SELECT ci.id,
               ci.role,
               ci.sort_order        AS "sortOrder",
               ci.title_override    AS "titleOverride",
               i.id                 AS "instructorId",
               i.name,
               i.title,
               i.bio,
               i.avatar_url         AS "avatarUrl",
               i.credentials,
               i.user_id            AS "userId",
               COUNT(DISTINCT ce.user_id) FILTER (WHERE ce.status = 'active') AS "totalStudents"
        FROM course_instructor ci
        JOIN instructor i ON i.id = ci.instructor_id
        LEFT JOIN course_enrollment ce ON ce.course_id = ci.course_id
        WHERE ci.course_id = ${courseId}
        GROUP BY ci.id, i.id
        ORDER BY ci.sort_order ASC;
      `);

      const rows = queryResult.rows as unknown as CourseInstructorDbRow[];
      return rows.map((r) => ({
        id: r.id,
        courseId,
        instructorId: r.instructorId,
        role: r.role,
        sortOrder: r.sortOrder,
        titleOverride: r.titleOverride ?? undefined,
        instructor: {
          id: r.instructorId,
          name: r.name,
          title: r.title ?? undefined,
          bio: r.bio ?? undefined,
          avatarUrl: r.avatarUrl ?? undefined,
          credentials: r.credentials ?? [],
          userId: r.userId ?? undefined,
          totalStudents: Number(r.totalStudents ?? 0),
        },
      }));
    } catch (error) {
      instructorLogger.error(
        `Failed to fetch instructors for course ${courseId}`,
        error as Error,
      );
      throw error;
    }
  },

  async updateInstructor(id: string, data: Partial<{
    name: string;
    title: string | undefined;
    bio: string | undefined;
    avatarUrl: string | undefined;
    credentials: string[] | undefined;
    userId: string | undefined;
  }>) {
    try {
      const [row] = await database
        .update(instructorSchema.instructor)
        .set(data)
        .where(eq(instructorSchema.instructor.id, id))
        .returning();
      return row;
    } catch (error) {
      instructorLogger.error('Failed to update instructor', error as Error);
      throw error;
    }
  },

  async updateCourseInstructorByKeys(courseId: string, instructorId: string, data: Partial<{
    role: 'primary' | 'co' | 'guest';
    sortOrder: number;
    titleOverride: string | undefined;
  }>) {
    try {
      const [row] = await database
        .update(instructorSchema.courseInstructor)
        .set(data)
        .where(
          and(
            eq(instructorSchema.courseInstructor.courseId, courseId),
            eq(instructorSchema.courseInstructor.instructorId, instructorId),
          ),
        )
        .returning();
      return row;
    } catch (error) {
      instructorLogger.error('Failed to update course_instructor', error as Error);
      throw error;
    }
  },

  /* -------------------------------------------------- */
  // Public read – marketing pages
  /* -------------------------------------------------- */

  async getPublicInstructor(instructorOrUserId: string) {
    try {
      const result = await database.execute(sql/* sql */`
        SELECT i.id,
               i.name,
               i.title,
               i.bio,
               i.avatar_url       AS "avatarUrl",
               i.credentials,
               COUNT(DISTINCT ce.user_id) FILTER (WHERE ce.status = 'active') AS "totalStudents"
        FROM instructor i
        LEFT JOIN course_instructor ci ON ci.instructor_id = i.id
        LEFT JOIN course_enrollment ce ON ce.course_id = ci.course_id
        WHERE i.id = ${instructorOrUserId} OR i.user_id = ${instructorOrUserId}
        GROUP BY i.id
        LIMIT 1;
      `);

      const [row] = result.rows as unknown as PublicInstructorDbRow[];

      if (!row) return;

      return {
        id: row.id,
        name: row.name,
        ...(row.title ? { title: row.title } : {}),
        ...(row.bio ? { bio: row.bio } : {}),
        ...(row.avatarUrl ? { avatarUrl: row.avatarUrl } : {}),
        credentials: row.credentials ?? [],
        totalStudents: Number(row.totalStudents ?? 0),
      } as const;
    } catch (error) {
      instructorLogger.error('Failed to fetch public instructor', error as Error);
      throw error;
    }
  },
}; 