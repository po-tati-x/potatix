import axios, { AxiosRequestConfig } from 'axios';
import type { Course, CreateCourseData, CreateLessonData, CreateModuleData, Lesson, Module } from '../../types/api';

// Ensure credentials are always sent with requests
axios.defaults.withCredentials = true;

// Simple wrapper for standardizing API responses and error handling
async function fetchWrapper<T>(
  method: 'get' | 'post' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = method === 'get' || method === 'delete'
      ? await axios[method](url, config)
      : await axios[method](url, data, config);
    
    return response.data;
  } catch (error) {
    console.error(`API error in ${method.toUpperCase()} ${url}:`, error);
    throw error;
  }
}

// Core API service with raw axios calls
export const apiService = {
  courses: {
    getAll: async (): Promise<Course[]> => {
      const data = await fetchWrapper<{ courses: Course[] }>('get', '/api/courses');
      return data.courses;
    },
    
    getById: async (id: string): Promise<Course> => {
      const data = await fetchWrapper<{ course: Course }>('get', `/api/courses/${id}`);
      return data.course;
    },
    
    getBySlug: async (slug: string): Promise<Course> => {
      const data = await fetchWrapper<{ course: Course }>('get', `/api/courses/slug/${slug}`);
      return data.course;
    },
    
    create: async (data: CreateCourseData) => {
      return fetchWrapper('post', '/api/courses', data);
    },
    
    update: async ({ id, data }: { id: string, data: CreateCourseData }) => {
      return fetchWrapper('patch', `/api/courses/${id}`, data);
    },
    
    delete: async (id: string) => {
      return fetchWrapper('delete', `/api/courses/${id}`);
    },

    uploadImage: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return fetchWrapper<{ fileUrl: string }>('post', '/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
  },
  
  modules: {
    getAll: async (courseId: string): Promise<Module[]> => {
      const data = await fetchWrapper<{ modules: Module[] }>('get', `/api/courses/${courseId}/modules`);
      return data.modules;
    },
    
    getById: async ({ courseId, moduleId }: { courseId: string, moduleId: string }): Promise<Module> => {
      const data = await fetchWrapper<{ module: Module }>('get', `/api/courses/${courseId}/modules/${moduleId}`);
      return data.module;
    },
    
    create: async ({ courseId, data }: { courseId: string, data: CreateModuleData }) => {
      return fetchWrapper('post', `/api/courses/${courseId}/modules`, data);
    },
    
    update: async ({ courseId, moduleId, data }: { courseId: string, moduleId: string, data: Partial<Module> }) => {
      return fetchWrapper('patch', `/api/courses/${courseId}/modules/${moduleId}`, data);
    },
    
    delete: async ({ courseId, moduleId }: { courseId: string, moduleId: string }) => {
      return fetchWrapper('delete', `/api/courses/${courseId}/modules/${moduleId}`);
    },
    
    reorder: async ({ courseId, modules }: { courseId: string, modules: { id: string; order: number }[] }) => {
      return fetchWrapper('patch', `/api/courses/${courseId}/modules/reorder`, { modules });
    },
  },
  
  lessons: {
    getAll: async (courseId: string): Promise<Lesson[]> => {
      const data = await fetchWrapper<{ lessons: Lesson[] }>('get', `/api/courses/${courseId}/lessons`);
      return data.lessons;
    },
    
    getById: async ({ courseId, lessonId }: { courseId: string, lessonId: string }): Promise<Lesson> => {
      const data = await fetchWrapper<{ lesson: Lesson }>('get', `/api/courses/${courseId}/lessons/${lessonId}`);
      return data.lesson;
    },
    
    create: async ({ courseId, data }: { courseId: string, data: CreateLessonData }) => {
      return fetchWrapper('post', `/api/courses/${courseId}/lessons`, data);
    },
    
    update: async ({ courseId, lessonId, data }: { courseId: string, lessonId: string, data: Partial<Lesson> }) => {
      return fetchWrapper('patch', `/api/courses/${courseId}/lessons/${lessonId}`, data);
    },
    
    delete: async ({ courseId, lessonId }: { courseId: string, lessonId: string }) => {
      return fetchWrapper('delete', `/api/courses/${courseId}/lessons/${lessonId}`);
    },
    
    reorder: async ({ courseId, lessons }: { courseId: string, lessons: { id: string; order: number }[] }) => {
      return fetchWrapper('patch', `/api/courses/${courseId}/lessons/reorder`, { lessons });
    },
  },
}; 