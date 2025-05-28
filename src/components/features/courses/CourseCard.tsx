'use client';

import Link from 'next/link';
import { BookOpen, ExternalLink, BookText, Clock } from 'lucide-react';
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
    
  // Format the price
  const formattedPrice = course.price > 0 
    ? `$${course.price.toFixed(2)}` 
    : 'Free';
    
  // Determine status badge styling
  const statusStyles = {
    draft: "bg-amber-50 text-amber-800 border-amber-200",
    published: "bg-emerald-50 text-emerald-800 border-emerald-200",
    archived: "bg-neutral-100 text-neutral-600 border-neutral-200"
  }[course.status || 'draft'];
    
  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="relative h-full border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-all duration-200 bg-white">
        {/* Course image or placeholder */}
        <div className="h-44 bg-neutral-100 overflow-hidden">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
              <BookOpen className="h-12 w-12 text-neutral-300" />
            </div>
          )}
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${statusStyles}`}>
            {course.status}
          </span>
        </div>
        
        {/* Course info */}
        <div className="p-5">
          <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-black">
            {course.title}
          </h3>
          
          {course.description && (
            <p className="text-neutral-500 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          )}
          
          <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-xs text-neutral-500">
                <BookText className="h-3.5 w-3.5 mr-1.5" />
                <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
              </div>
              
              <div className="flex items-center text-xs text-neutral-500">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'Recently'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="font-medium text-sm">
                {formattedPrice}
              </span>
              <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 