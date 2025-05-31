import axios from 'axios';

// Ensure credentials are always sent with requests
axios.defaults.withCredentials = true;

// Base API types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Course related types
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoId?: string;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  userId: string;
  lessonCount?: number;
  createdAt: string;
  updatedAt?: string;
  lessons?: Lesson[];
  slug?: string;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  price: number;
  status?: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  lessons?: {
    title: string;
    description?: string;
    videoId?: string | null;
  }[];
}

export interface CreateLessonData {
  title: string;
  description?: string;
  videoId?: string;
  order: number;
}

// API error handler
const handleApiError = (error: unknown, message: string): never => {
  if (axios.isAxiosError(error)) {
    console.error(`${message}: ${error.response?.status} ${error.response?.statusText}`);
    console.error('Response:', error.response?.data);
    
    // Throw a more informative error
    throw new Error(
      `API Error: ${error.response?.data?.error || error.message || message}`
    );
  }
  
  console.error(message, error);
  throw error;
};

// API client functions for courses
export const coursesApi = {
  // Get all courses for the current user
  getAll: async (): Promise<Course[]> => {
    try {
      const response = await axios.get('/api/courses');
      return response.data.courses;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch courses');
    }
  },
  
  // Get a single course by ID
  getById: async (id: string): Promise<Course> => {
    try {
      const response = await axios.get(`/api/courses/${id}`);
      return response.data.course;
    } catch (error) {
      return handleApiError(error, `Failed to fetch course ${id}`);
    }
  },
  
  // Get a single course by slug
  getBySlug: async (slug: string): Promise<Course> => {
    try {
      const response = await axios.get(`/api/courses/slug/${slug}`);
      return response.data.course;
    } catch (error) {
      return handleApiError(error, `Failed to fetch course with slug ${slug}`);
    }
  },
  
  // Create a new course
  create: async (data: CreateCourseData): Promise<{ id: string }> => {
    try {
      const response = await axios.post('/api/courses', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to create course');
    }
  },
  
  // Update a course
  update: async (id: string, data: CreateCourseData): Promise<{ success: boolean }> => {
    try {
      await axios.patch(`/api/courses/${id}`, data);
      return { success: true };
    } catch (error) {
      return handleApiError(error, `Failed to update course ${id}`);
    }
  },
  
  // Delete a course
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      await axios.delete(`/api/courses/${id}`);
      return { success: true };
    } catch (error) {
      return handleApiError(error, `Failed to delete course ${id}`);
    }
  },

  // Lessons related operations
  lessons: {
    // Create lesson
    async create(courseId: string, data: CreateLessonData): Promise<{ id: string }> {
      try {
        const response = await axios.post(`/api/courses/${courseId}/lessons`, data);
        return { id: response.data.id };
      } catch (error) {
        return handleApiError(error, 'Failed to create lesson');
      }
    },

    // Get lesson by ID
    async getById(courseId: string, lessonId: string): Promise<Lesson> {
      try {
        const response = await axios.get(`/api/courses/${courseId}/lessons/${lessonId}`);
        return response.data.lesson;
      } catch (error) {
        return handleApiError(error, `Failed to fetch lesson ${lessonId}`);
      }
    },

    // Update lesson
    async update(courseId: string, lessonId: string, data: Partial<Lesson>): Promise<{ success: boolean }> {
      try {
        await axios.patch(`/api/courses/${courseId}/lessons/${lessonId}`, data);
        return { success: true };
      } catch (error) {
        return handleApiError(error, `Failed to update lesson ${lessonId}`);
      }
    },

    // Delete lesson
    async delete(courseId: string, lessonId: string): Promise<{ success: boolean }> {
      try {
        await axios.delete(`/api/courses/${courseId}/lessons/${lessonId}`);
        return { success: true };
      } catch (error) {
        return handleApiError(error, `Failed to delete lesson ${lessonId}`);
      }
    },
    
    // Reorder lessons
    async reorderLessons(courseId: string, lessons: { id: string; order: number }[]): Promise<{ success: boolean }> {
      try {
        await axios.patch(`/api/courses/${courseId}/lessons/reorder`, { lessons });
        return { success: true };
      } catch (error) {
        return handleApiError(error, 'Failed to reorder lessons');
      }
    }
  },

  // Upload a course image
  uploadImage: async (file: File): Promise<{ fileUrl: string }> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload directly to our API endpoint
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        fileUrl: response.data.fileUrl
      };
    } catch (error) {
      return handleApiError(error, 'Failed to upload image');
    }
  },
}; 