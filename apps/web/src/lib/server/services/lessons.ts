import { db, courseSchema } from "@potatix/db";
import { eq, and, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getMuxAssetId, deleteMuxAsset } from "@/lib/server/utils/mux";
import { courseService } from "./courses";

const database = db!; // assume initialized elsewhere

// Types
export interface LessonCreateInput {
  title: string;
  description?: string | null;
  videoId?: string | null;
  order: number;
  moduleId: string;
  courseId: string;
}

export interface LessonUpdateInput {
  title?: string;
  description?: string | null;
  videoId?: string | null;
  order?: number;
  uploadStatus?: string;
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
        videoId: courseSchema.lesson.videoId,
        uploadStatus: courseSchema.lesson.uploadStatus,
        order: courseSchema.lesson.order,
        moduleId: courseSchema.lesson.moduleId,
        courseId: courseSchema.lesson.courseId,
        createdAt: courseSchema.lesson.createdAt,
        updatedAt: courseSchema.lesson.updatedAt,
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
        videoId: courseSchema.lesson.videoId,
        uploadStatus: courseSchema.lesson.uploadStatus,
        order: courseSchema.lesson.order,
        moduleId: courseSchema.lesson.moduleId,
        courseId: courseSchema.lesson.courseId,
        createdAt: courseSchema.lesson.createdAt,
        updatedAt: courseSchema.lesson.updatedAt,
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
        videoId: data.videoId || null,
        order: data.order,
        moduleId: data.moduleId,
        courseId: data.courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return { id: newLesson[0].id, lesson: newLesson[0] };
  },
  
  async updateLesson(lessonId: string, data: LessonUpdateInput) {
    const updatedLesson = await database
      .update(courseSchema.lesson)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.videoId !== undefined ? { videoId: data.videoId } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.uploadStatus !== undefined ? { uploadStatus: data.uploadStatus } : {}),
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
      return { success: false, error: "Lesson not found" };
    }
    
    // Delete lesson from database
    await database
      .delete(courseSchema.lesson)
      .where(eq(courseSchema.lesson.id, lessonId));
    
    // If the lesson has a video, delete it from Mux
    if (lesson.videoId) {
      // Get the Mux asset ID (properly await the Promise)
      const muxAssetId = await getMuxAssetId(lesson.videoId);
      if (muxAssetId) {
        try {
          await deleteMuxAsset(muxAssetId);
        } catch (err) {
          console.error("Failed to delete Mux asset:", err);
        }
      }
    }
    
    return { success: true };
  },
  
  async checkLessonOwnership(lessonId: string, courseId: string, userId: string): Promise<OwnershipCheckResult> {
    // First check course ownership
    const courseCheck = await courseService.checkCourseOwnership(courseId, userId);
    
    if (!courseCheck.owned) {
      const err = courseCheck.error!;
      return { owned: false, error: err.error, status: err.status };
    }
    
    // Check if lesson exists and belongs to the course
    const lessons = await database
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
      return { owned: false, error: "Lesson not found", status: 404 };
    }
    
    return { owned: true, lesson: lessons[0] };
  },
  
  async reorderLessons(moduleId: string, lessonIds: string[]) {
    // Update the order of each lesson
    const updates = lessonIds.map((lessonId, index) => {
      return database
        .update(courseSchema.lesson)
        .set({ order: index, updatedAt: new Date() })
        .where(
          and(
            eq(courseSchema.lesson.id, lessonId),
            eq(courseSchema.lesson.moduleId, moduleId)
          )
        );
    });
    
    // Execute all updates
    await Promise.all(updates);
    
    // Return the reordered lessons
    return this.getLessonsByModuleId(moduleId);
  }
} 