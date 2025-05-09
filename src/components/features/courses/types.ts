/**
 * Type definitions for course-related components
 */

export interface Course {
  id: string;
  title: string;
  students: number;
  revenue: number;
  rating: number;
  status: 'published' | 'draft';
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoId?: string;
  duration?: string;
  size?: string;
  watched?: number;
  order?: number;
  file?: File;
  fileName?: string;
  fileSize?: string;
  progress?: number;
} 