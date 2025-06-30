import axios from "axios";
import type { Instructor, CourseInstructor } from "@/lib/shared/types/courses";
import type { ApiResponse } from "@/lib/shared/types/api";

export const instructorApi = {
  async getCourseInstructors(courseId: string): Promise<CourseInstructor[]> {
    const res = await axios.get<ApiResponse<CourseInstructor[]>>(`/api/courses/${courseId}/instructors`);
    return res.data.data;
  },

  async addCourseInstructor(courseId: string, payload: Partial<{
    instructorId: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl: string;
    credentials: string[];
    role: 'primary' | 'co' | 'guest';
    sortOrder: number;
    titleOverride: string;
  }>): Promise<CourseInstructor> {
    const res = await axios.post<ApiResponse<CourseInstructor>>(`/api/courses/${courseId}/instructors`, payload);
    return res.data.data;
  },

  async uploadInstructorAvatar(instructorId: string, formData: FormData): Promise<{ avatarUrl: string }> {
    const res = await axios.post<ApiResponse<{ avatarUrl: string }>>(`/api/instructors/${instructorId}/image`, formData);
    return res.data.data;
  },

  async updateCourseInstructor(courseId: string, instructorId: string, payload: Partial<{
    name: string;
    title: string;
    bio: string;
    credentials: string[];
    titleOverride: string;
    role: 'primary' | 'co' | 'guest';
    sortOrder: number;
  }>): Promise<CourseInstructor[]> {
    const res = await axios.patch<ApiResponse<CourseInstructor[]>>(`/api/courses/${courseId}/instructors/${instructorId}`, payload);
    return res.data.data;
  },

  async deleteCourseInstructor(courseId: string, instructorId: string): Promise<void> {
    await axios.delete<ApiResponse<void>>(`/api/courses/${courseId}/instructors/${instructorId}`);
  },

  async getInstructor(instructorId: string): Promise<Instructor & { totalStudents: number }> {
    const res = await axios.get<ApiResponse<Instructor & { totalStudents: number }>>(`/api/instructors/${instructorId}`);
    return res.data.data;
  },
}; 