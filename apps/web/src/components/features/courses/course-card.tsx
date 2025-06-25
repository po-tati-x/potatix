'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ExternalLink, BookText, Clock } from 'lucide-react';
import type { Course } from '@/lib/shared/types/courses';
import { formatMonthDay } from '@/lib/shared/utils/format';

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
  const statusMap = {
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    archived: "bg-slate-50 text-slate-600 border-slate-200"
  } as const;
  
  // Get status style with fallback to draft
  const status = course.status || 'draft';
  const statusStyles = statusMap[status as keyof typeof statusMap];
    
  return (
    <Link href={`/courses/${course.slug!}`} className="block group">
      <div className="relative h-full border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-sm transition-all duration-200 bg-white">
        {/* Course image or placeholder */}
        <div className="h-44 bg-slate-50 overflow-hidden relative">
          {course.imageUrl ? (
            <Image 
              src={course.imageUrl} 
              alt={course.title} 
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
              <BookOpen className="h-12 w-12 text-slate-300" />
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
          <h3 className="font-medium text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-slate-800">
            {course.title}
          </h3>
          
          {course.description && (
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          )}
          
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-xs text-slate-500">
                <BookText className="h-3.5 w-3.5 mr-1.5" />
                <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
              </div>
              
              <div className="flex items-center text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {course.updatedAt ? formatMonthDay(course.updatedAt) : 'Recently'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium text-slate-700">
                {formattedPrice}
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 