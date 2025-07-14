import { database, courseSchema } from '@potatix/db';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Types
export interface ModuleCreateInput {
  title: string;
  description?: string | undefined;
  order?: number;
  courseId: string;
}

export interface ModuleUpdateInput {
  title?: string;
  description?: string | undefined;
  order?: number;
}

// Module Service
export const moduleService = {
  async getModulesByCourseId(courseId: string) {
    return database
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
  },

  async getModuleById(moduleId: string) {
    const modules = await database
      .select()
      .from(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.id, moduleId))
      .limit(1);

    // Return the first module when found; otherwise undefined
    return modules[0];
  },

  async createModule(data: ModuleCreateInput) {
    const moduleId = `module-${nanoid()}`;

    // Get the current highest order for this course
    const existingModules = await database
      .select({ order: courseSchema.courseModule.order })
      .from(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.courseId, data.courseId))
      .orderBy(desc(courseSchema.courseModule.order))
      .limit(1);

    const current = existingModules[0];
    const nextOrder = current ? (current.order || 0) + 1 : 0;

    // Create module
    const newModule = await database
      .insert(courseSchema.courseModule)
      .values({
        id: moduleId,
        title: data.title,
        // Store description when provided; leave undefined otherwise
        description: data.description ?? undefined,
        order: data.order === undefined ? nextOrder : data.order,
        courseId: data.courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const created = newModule[0]!;
    return created;
  },

  async updateModule(moduleId: string, data: ModuleUpdateInput) {
    const updatedModule = await database
      .update(courseSchema.courseModule)
      .set({
        ...(data.title === undefined ? {} : { title: data.title }),
        ...(data.description === undefined ? {} : { description: data.description }),
        ...(data.order === undefined ? {} : { order: data.order }),
        updatedAt: new Date(),
      })
      .where(eq(courseSchema.courseModule.id, moduleId))
      .returning();

    const updated = updatedModule[0]!;
    return updated;
  },

  async deleteModule(moduleId: string) {
    // Get lessons associated with this module to later reassign them
    const lessons = await database
      .select()
      .from(courseSchema.lesson)
      .where(eq(courseSchema.lesson.moduleId, moduleId));

    // Get the module to get courseId
    const mod = await this.getModuleById(moduleId);

    if (!mod) {
      return { success: false, error: 'Module not found' };
    }

    // Delete module
    await database
      .delete(courseSchema.courseModule)
      .where(eq(courseSchema.courseModule.id, moduleId));

    // If there were lessons in this module, we need to reassign them or delete them
    if (lessons.length > 0) {
      // Find another module in the same course
      const otherModules = await database
        .select()
        .from(courseSchema.courseModule)
        .where(eq(courseSchema.courseModule.courseId, mod.courseId))
        .limit(1);

      if (otherModules.length > 0) {
        // Reassign lessons to another module
        const targetModuleId = otherModules[0]!.id;

        await database
          .update(courseSchema.lesson)
          .set({ moduleId: targetModuleId })
          .where(eq(courseSchema.lesson.moduleId, moduleId));

        return { success: true, lessonsReassigned: lessons.length };
      } else {
        // Delete the lessons if no other module exists
        await database
          .delete(courseSchema.lesson)
          .where(eq(courseSchema.lesson.moduleId, moduleId));

        return { success: true, lessonsDeleted: lessons.length };
      }
    }

    return { success: true };
  },

  async reorderModules(courseId: string, moduleIds: string[]) {
    if (moduleIds.length === 0) {
      return this.getModulesByCourseId(courseId);
    }

    // Build a single efficient UPDATE query using CASE statement
    const caseStatements = moduleIds
      .map((moduleId, index) => `WHEN id = '${moduleId}' THEN ${index}`)
      .join(' ');

    const moduleIdList = moduleIds.map(id => `'${id}'`).join(', ');

    // Single UPDATE query that updates all modules at once
    await database.execute(sql`
      UPDATE course_module
      SET
        "order" = CASE ${sql.raw(caseStatements)} END,
        updated_at = NOW()
      WHERE id IN (${sql.raw(moduleIdList)})
        AND course_id = ${courseId}
    `);

    // Return the reordered modules
    return this.getModulesByCourseId(courseId);
  },
};
