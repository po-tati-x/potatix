import { db, courseSchema } from '@potatix/db';
import { eq, and, asc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getMuxAssetId, deleteMuxAsset } from '@/lib/server/utils/mux';

const database = db!; // assume initialized elsewhere

// Types
export interface LessonCreateInput {
  title: string;
  description?: string | null;
  playbackId?: string | null;
  order: number;
  moduleId: string;
  courseId: string;
}

export interface LessonUpdateInput {
  title?: string;
  description?: string | null;
  playbackId?: string | null;
  order?: number;
  uploadStatus?: string;
  visibility?: 'public' | 'enrolled';
  transcriptData?: unknown; // JSON field
}

interface OwnershipFail {
  owned: false;
  error: string;
  status: number;
}

interface OwnershipSuccess {
  owned: true;
  lesson: Record<string, unknown>;
}

export type OwnershipCheckResult = OwnershipFail | OwnershipSuccess;

// Lesson Service
export const lessonService = {
  async getLessonsByCourseId(courseId: string) {
    return database
      .select({
        id: courseSchema.lesson.id,
        title: courseSchema.lesson.title,
        description: courseSchema.lesson.description,
        playbackId: courseSchema.lesson.playbackId,
        duration: courseSchema.lesson.duration,
        uploadStatus: courseSchema.lesson.uploadStatus,
        visibility: courseSchema.lesson.visibility,
        order: courseSchema.lesson.order,
        moduleId: courseSchema.lesson.moduleId,
        courseId: courseSchema.lesson.courseId,
        createdAt: courseSchema.lesson.createdAt,
        updatedAt: courseSchema.lesson.updatedAt,
        width: courseSchema.lesson.width,
        height: courseSchema.lesson.height,
        aspectRatio: courseSchema.lesson.aspectRatio,
        transcriptData: courseSchema.lesson.transcriptData,
        aiPrompts: courseSchema.lesson.aiPrompts,
      })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, courseId))
      .orderBy(asc(courseSchema.lesson.order));
  },

  async getLessonsByModuleId(moduleId: string) {
    return database
      .select({
        id: courseSchema.lesson.id,
        title: courseSchema.lesson.title,
        description: courseSchema.lesson.description,
        playbackId: courseSchema.lesson.playbackId,
        duration: courseSchema.lesson.duration,
        uploadStatus: courseSchema.lesson.uploadStatus,
        visibility: courseSchema.lesson.visibility,
        order: courseSchema.lesson.order,
        moduleId: courseSchema.lesson.moduleId,
        courseId: courseSchema.lesson.courseId,
        createdAt: courseSchema.lesson.createdAt,
        updatedAt: courseSchema.lesson.updatedAt,
        width: courseSchema.lesson.width,
        height: courseSchema.lesson.height,
        aspectRatio: courseSchema.lesson.aspectRatio,
        transcriptData: courseSchema.lesson.transcriptData,
        aiPrompts: courseSchema.lesson.aiPrompts,
      })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.moduleId, moduleId))
      .orderBy(asc(courseSchema.lesson.order));
  },

  async getLessonById(lessonId: string) {
    const lessons = await database
      .select()
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.id, lessonId))
      .limit(1);

    return lessons[0] || null;
  },

  async createLesson(data: LessonCreateInput) {
    const lessonId = `lesson-${nanoid()}`;

    // Insert the lesson
    const newLesson = await database
      .insert(courseSchema.lesson)
      .values({
        id: lessonId,
        title: data.title,
        description: data.description || null,
        playbackId: data.playbackId || null,
        order: data.order,
        moduleId: data.moduleId,
        courseId: data.courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const created = newLesson[0]!; // ensure non-undefined after insert
    return { id: created.id, lesson: created };
  },

  async updateLesson(lessonId: string, data: LessonUpdateInput) {
    const updatedLesson = await database
      .update(courseSchema.lesson)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.playbackId !== undefined ? { playbackId: data.playbackId } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.uploadStatus !== undefined ? { uploadStatus: data.uploadStatus } : {}),
        ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
        ...(data.transcriptData !== undefined
          ? { transcriptData: data.transcriptData as any }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(courseSchema.lesson.id, lessonId))
      .returning();

    return updatedLesson[0];
  },

  async deleteLesson(lessonId: string) {
    // Get the lesson to delete its video if it exists
    const lesson = await this.getLessonById(lessonId);

    if (!lesson) {
      return { success: false, error: 'Lesson not found' };
    }

    // Delete lesson from database
    await database.delete(courseSchema.lesson).where(eq(courseSchema.lesson.id, lessonId));

    // If the lesson has a video, delete it from Mux
    if (lesson.playbackId) {
      // Get the Mux asset ID (properly await the Promise)
      const muxAssetId = await getMuxAssetId(lesson.playbackId);
      if (muxAssetId) {
        try {
          await deleteMuxAsset(muxAssetId);
        } catch (err) {
          console.error('Failed to delete Mux asset:', err);
        }
      }
    }

    return { success: true };
  },

  async checkLessonOwnership(
    lessonId: string,
    courseId: string,
    userId: string,
  ): Promise<OwnershipCheckResult> {
    try {
      // Verify lesson exists *and* its parent course belongs to the user in a single query
      const rows = await database
        .select({
          id: courseSchema.lesson.id,
          title: courseSchema.lesson.title,
          description: courseSchema.lesson.description,
          playbackId: courseSchema.lesson.playbackId,
          courseId: courseSchema.lesson.courseId,
          moduleId: courseSchema.lesson.moduleId,
          order: courseSchema.lesson.order,
          uploadStatus: courseSchema.lesson.uploadStatus,
          visibility: courseSchema.lesson.visibility,
          createdAt: courseSchema.lesson.createdAt,
          updatedAt: courseSchema.lesson.updatedAt,
        })
        .from(courseSchema.lesson)
        .innerJoin(courseSchema.course, eq(courseSchema.lesson.courseId, courseSchema.course.id))
        .where(
          and(
            eq(courseSchema.lesson.id, lessonId),
            eq(courseSchema.lesson.courseId, courseId),
            eq(courseSchema.course.userId, userId),
          ),
        )
        .limit(1);

      if (!rows.length) {
        return { owned: false, error: 'Lesson not found or access denied', status: 403 };
      }

      return { owned: true, lesson: rows[0]! };
    } catch (error) {
      console.error('[lessonService] Failed ownership check', error);
      return { owned: false, error: 'Failed to verify ownership', status: 500 };
    }
  },

  async reorderLessons(moduleId: string, lessonIds: string[]) {
    if (lessonIds.length === 0) {
      return this.getLessonsByModuleId(moduleId);
    }

    // Build a single efficient UPDATE query using CASE statement
    const caseStatements = lessonIds
      .map((lessonId, index) => `WHEN id = '${lessonId}' THEN ${index}`)
      .join(' ');

    const lessonIdList = lessonIds.map(id => `'${id}'`).join(', ');

    // Single UPDATE query that updates all lessons at once
    await database.execute(sql`
      UPDATE lesson
      SET
        "order" = CASE ${sql.raw(caseStatements)} END,
        updated_at = NOW()
      WHERE id IN (${sql.raw(lessonIdList)})
        AND module_id = ${moduleId}
    `);

    // Return the reordered lessons
    return this.getLessonsByModuleId(moduleId);
  },

  /**
   * Reorder lessons across multiple modules in a single batch operation.
   * Each lesson can move to a new module.
   * @param courseId – Parent course (permission already validated upstream)
   * @param moduleOrders – Array of { moduleId, lessonIds } representing final order per module.
   */
  async reorderLessonsAcrossModules(
    courseId: string,
    moduleOrders: { moduleId: string; lessonIds: string[] }[],
  ) {
    const allUpdates: Array<{ lessonId: string; moduleId: string; order: number }> = [];

    // Flatten all updates into a single array
    for (const { moduleId, lessonIds } of moduleOrders) {
      lessonIds.forEach((lessonId, index) => {
        allUpdates.push({ lessonId, moduleId, order: index });
      });
    }

    if (allUpdates.length === 0) {
      return this.getLessonsByCourseId(courseId);
    }

    // Build VALUES clause for efficient batch update
    const valuesClause = allUpdates
      .map(({ lessonId, moduleId, order }) => `('${lessonId}', '${moduleId}', ${order})`)
      .join(', ');

    // Single UPDATE query using VALUES clause - much more efficient than N queries
    await database.execute(sql`
      UPDATE lesson
      SET
        module_id = updates.new_module_id,
        "order" = updates.new_order,
        updated_at = NOW()
      FROM (VALUES ${sql.raw(valuesClause)}) AS updates(lesson_id, new_module_id, new_order)
      WHERE lesson.id = updates.lesson_id
        AND lesson.course_id = ${courseId}
    `);

    // Return refreshed lessons grouped by module id for client convenience
    const lessons = await this.getLessonsByCourseId(courseId);
    return lessons;
  },

  async getLessonPrompts(lessonId: string): Promise<string[] | null> {
    const lesson = await this.getLessonById(lessonId);
    if (!lesson) return null;
    return (lesson as any).aiPrompts ?? null;
  },

  async saveLessonPrompts(lessonId: string, prompts: string[]): Promise<void> {
    await database
      .update(courseSchema.lesson)
      .set({ aiPrompts: prompts, updatedAt: new Date() })
      .where(eq(courseSchema.lesson.id, lessonId));
  },

  async getLessonSummariesByCourseId(courseId: string) {
    // Lightweight select for sidebar: id, title, visibility(status), order, moduleId
    return database
      .select({
        id: courseSchema.lesson.id,
        title: courseSchema.lesson.title,
        visibility: courseSchema.lesson.visibility, // 'public' | 'enrolled'
        order: courseSchema.lesson.order,
        moduleId: courseSchema.lesson.moduleId,
      })
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.courseId, courseId))
      .orderBy(asc(courseSchema.lesson.order));
  },
};
