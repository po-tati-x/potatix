'use client';

import { CourseCard } from './CourseCard';
import { Course } from '@/lib/utils/api-client';

interface CoursesGridProps {
  courses: Course[];
}

/**
 * Grid component for displaying multiple courses
 */
export function CoursesGrid({ courses }: CoursesGridProps) {
  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-500">No courses yet. Create your first course to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
} 