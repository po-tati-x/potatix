'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Course } from '@/lib/utils/api-client';

interface CourseCardProps {
  course: Course;
}

/**
 * Card component for displaying course information
 */
export function CourseCard({ course }: CourseCardProps) {
  // Calculate the lesson count - use lessonCount if available, otherwise use the length of the lessons array if present
  const lessonCount = course.lessonCount !== undefined 
    ? course.lessonCount 
    : (course.lessons?.length || 0);
    
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="block h-full border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
        <div className="h-40 bg-neutral-100 flex items-center justify-center">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-12 w-12 text-neutral-400" />
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg text-neutral-900 line-clamp-2">
              {course.title}
            </h3>
            <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 capitalize">
              {course.status}
            </span>
          </div>
          <div className="flex justify-between text-sm text-neutral-500">
            <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
            <span>${course.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 