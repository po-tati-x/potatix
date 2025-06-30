import { db, instructorSchema } from '@potatix/db';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger';

const instructorLogger = logger.child('InstructorService');
const database = db!;

export interface CreateInstructorInput {
  name: string;
  title?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  credentials?: string[] | null;
  userId?: string | null;
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
        title: data.title,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        credentials: data.credentials ?? [],
        userId: data.userId ?? null,
      });
      return { id, ...data, credentials: data.credentials ?? [] };
    } catch (err) {
      instructorLogger.error('Failed to create instructor', err as Error);
      throw err;
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
    titleOverride?: string | null;
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
    } catch (err) {
      instructorLogger.error('Failed to link instructor to course', err as Error);
      throw err;
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
    } catch (err) {
      instructorLogger.error('Failed to unlink instructor', err as Error);
      throw err;
    }
  },

  async updateCourseInstructor(
    id: string,
    data: Partial<{
      role: 'primary' | 'co' | 'guest';
      sortOrder: number;
      titleOverride: string | null;
    }>,
  ) {
    try {
      const [row] = await database
        .update(instructorSchema.courseInstructor)
        .set(data)
        .where(eq(instructorSchema.courseInstructor.id, id))
        .returning();
      return row;
    } catch (err) {
      instructorLogger.error('Failed to update course instructor', err as Error);
      throw err;
    }
  },

  async getInstructorsByCourse(courseId: string) {
    try {
      const rows = (await database.execute(sql/* sql */`
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
      `)).rows as Array<any>;
      return rows.map((r) => ({
        id: r.id,
        courseId,
        instructorId: r.instructorId,
        role: r.role as 'primary' | 'co' | 'guest',
        sortOrder: r.sortOrder,
        titleOverride: r.titleOverride ?? undefined,
        instructor: {
          id: r.instructorId,
          name: r.name,
          title: r.title ?? undefined,
          bio: r.bio ?? undefined,
          avatarUrl: r.avatarUrl ?? null,
          credentials: r.credentials ?? [],
          userId: r.userId ?? null,
          totalStudents: Number(r.totalStudents ?? 0),
        },
      }));
    } catch (err) {
      instructorLogger.error(
        `Failed to fetch instructors for course ${courseId}`,
        err as Error,
      );
      throw err;
    }
  },

  async updateInstructor(id: string, data: Partial<{
    name: string;
    title: string | null;
    bio: string | null;
    avatarUrl: string | null;
    credentials: string[] | null;
    userId: string | null;
  }>) {
    try {
      const [row] = await database
        .update(instructorSchema.instructor)
        .set(data)
        .where(eq(instructorSchema.instructor.id, id))
        .returning();
      return row;
    } catch (err) {
      instructorLogger.error('Failed to update instructor', err as Error);
      throw err;
    }
  },

  async updateCourseInstructorByKeys(courseId: string, instructorId: string, data: Partial<{
    role: 'primary' | 'co' | 'guest';
    sortOrder: number;
    titleOverride: string | null;
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
    } catch (err) {
      instructorLogger.error('Failed to update course_instructor', err as Error);
      throw err;
    }
  },

  /* -------------------------------------------------- */
  // Public read – marketing pages
  /* -------------------------------------------------- */

  async getPublicInstructor(instructorOrUserId: string) {
    try {
      const [row] = (await database.execute(sql/* sql */`
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
      `)).rows as Array<any>;

      if (!row) return null;

      return {
        id: row.id,
        name: row.name,
        title: row.title ?? undefined,
        bio: row.bio ?? undefined,
        avatarUrl: row.avatarUrl ?? null,
        credentials: row.credentials ?? [],
        totalStudents: Number(row.totalStudents ?? 0),
      } as {
        id: string;
        name: string;
        title?: string;
        bio?: string;
        avatarUrl?: string | null;
        credentials: string[];
        totalStudents: number;
      };
    } catch (err) {
      instructorLogger.error('Failed to fetch public instructor', err as Error);
      throw err;
    }
  },
}; 