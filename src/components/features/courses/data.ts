/**
 * Mock data for course components
 */
import { Course } from './types';

// Minimal mock data for initial UI
export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Advanced TypeScript Patterns',
    students: 47,
    revenue: 3760,
    rating: 4.8,
    status: 'published',
    updatedAt: '2023-11-15T14:23:54Z',
  },
  {
    id: '2',
    title: 'Rust for JavaScript Developers',
    students: 12,
    revenue: 960,
    rating: 4.6,
    status: 'published',
    updatedAt: '2023-12-03T09:45:12Z',
  },
  {
    id: '3',
    title: 'Building a Compiler from Scratch',
    students: 0,
    revenue: 0,
    rating: 0,
    status: 'draft',
    updatedAt: '2024-01-22T16:34:29Z',
  },
]; 