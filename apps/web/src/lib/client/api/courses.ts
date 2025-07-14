/**
 * Client-side API functions for course-related operations
 */
import axios from "axios";
import type { Course, CreateCourseData } from "@/lib/shared/types/courses";
import type { ApiResponse } from "@/lib/shared/types/api";

// Re-export Course type for use in hooks
export type { Course } from "@/lib/shared/types/courses";

/**
 * Course API functions
 */
export const courseApi = {
  async getAllCourses(): Promise<Course[]> {
    const response = await axios.get<ApiResponse<Course[]>>("/api/courses");
    return response.data.data;
  },

  async createCourse(courseData: CreateCourseData): Promise<Course> {
    const response = await axios.post<ApiResponse<Course>>("/api/courses", courseData);
    return response.data.data;
  },

  async getCourse(courseId: string): Promise<Course> {
    const response = await axios.get<ApiResponse<Course>>(`/api/courses/${courseId}`);
    return response.data.data;
  },

  async getCourseBySlug(slug: string, includeUnpublished: boolean = false): Promise<Course> {
    const query = includeUnpublished ? '?includeUnpublished=true' : '';
    const response = await axios.get<ApiResponse<Course>>(`/api/courses/slug/${slug}${query}`);
    return response.data.data;
  },

  // Lightweight outline (modules + lesson summaries)
  async getCourseOutlineBySlug(slug: string, includeUnpublished: boolean = false): Promise<Course> {
    const query = includeUnpublished ? '?includeUnpublished=true' : '';
    const response = await axios.get<ApiResponse<Course>>(`/api/courses/outline/${slug}${query}`);
    return response.data.data;
  },

  async updateCourse(courseId: string, data: Partial<CreateCourseData>): Promise<Course> {
    const response = await axios.patch<ApiResponse<Course>>(`/api/courses/${courseId}`, data);
    return response.data.data;
  },

  async deleteCourse(courseId: string): Promise<void> {
    await axios.delete<ApiResponse<void>>(`/api/courses/${courseId}`);
  },

  async uploadCourseImage(courseId: string, formData: FormData): Promise<{ imageUrl: string }> {
    const response = await axios.post<ApiResponse<{ imageUrl: string }>>(`/api/courses/${courseId}/image`, formData);
    return response.data.data;
  },

  // Module operations
  async createModule(data: { courseId: string; title: string }): Promise<unknown> {
    const response = await axios.post<ApiResponse<unknown>>(`/api/courses/modules`, data);
    return response.data.data;
  },

  async updateModule(data: { moduleId: string; title: string }): Promise<unknown> {
    const response = await axios.patch<ApiResponse<unknown>>(`/api/courses/modules/${data.moduleId}`, {
      title: data.title,
    });
    return response.data.data;
  },

  async deleteModule(moduleId: string): Promise<void> {
    await axios.delete<ApiResponse<void>>(`/api/courses/modules/${moduleId}`);
  },

  // Lesson operations
  async createLesson(data: { moduleId: string; title: string; courseId: string }): Promise<unknown> {
    const response = await axios.post<ApiResponse<unknown>>(`/api/courses/lessons`, data);
    return response.data.data;
  },

  async updateLesson(data: { lessonId: string; title?: string; description?: string; visibility?: 'public' | 'enrolled'; playbackId?: string | undefined; uploadStatus?: string | undefined; transcriptData?: unknown }): Promise<unknown> {
    const { lessonId, ...updateData } = data;
    const response = await axios.patch<ApiResponse<unknown>>(`/api/courses/lessons/${lessonId}`, updateData);
    return response.data.data;
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await axios.delete<ApiResponse<void>>(`/api/courses/lessons/${lessonId}`);
  },

  // Reordering operations
  async reorderLessons(data: { courseId: string; moduleId: string; orderedIds: string[] }): Promise<void> {
    await axios.post<ApiResponse<void>>(`/api/courses/reorder`, {
      type: "lesson",
      courseId: data.courseId,
      moduleId: data.moduleId,
      orderedIds: data.orderedIds,
    });
  },

  async reorderLessonsAcrossModules(data: { courseId: string; modules: { moduleId: string; lessonIds: string[] }[] }): Promise<void> {
    await axios.post<ApiResponse<void>>(`/api/courses/reorder`, {
      type: "lesson-multi",
      courseId: data.courseId,
      modules: data.modules,
    });
  },

  async reorderModules(data: { courseId: string; orderedIds: string[] }): Promise<void> {
    await axios.post<ApiResponse<void>>(`/api/courses/reorder`, {
      type: "module",
      courseId: data.courseId,
      orderedIds: data.orderedIds,
    });
  },

  // Fetch single lesson details
  async getLesson(courseId: string, lessonId: string) {
    const response = await axios.get<ApiResponse<unknown>>(`/api/courses/${courseId}/lessons/${lessonId}`);
    return response.data.data;
  },
};
