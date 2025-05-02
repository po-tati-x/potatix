// Course type definitions
export interface CourseType {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  published: boolean;
  students: number;
  rating: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Sort options
export type SortField = 'title' | 'category' | 'level' | 'published' | 'students' | 'rating' | 'price' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

// Filter options
export type StatusFilter = 'all' | 'published' | 'draft'; 