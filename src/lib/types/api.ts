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
  uploadStatus?: string;
  order: number;
  courseId: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
}

// Add legacy type alias for backward compatibility 
export type Module = CourseModule;

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
  modules?: CourseModule[];
  slug?: string;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  price: number;
  status?: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  slug?: string;
  lessons?: {
    title: string;
    description?: string;
    videoId?: string | null;
  }[];
}

export interface CreateModuleData {
  title: string;
  description?: string;
  order: number;
  courseId: string;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  videoId?: string;
  order: number;
  moduleId: string;
} 