'use client';

import Link from 'next/link';
import { Course } from './types';
import { formatDate, formatCurrency, getRevenueColorClass } from './utils';
import { Clock, MoreHorizontal, Users, Star, DollarSign, ArrowUpRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

/**
 * Card component for displaying course information
 */
export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                course.status === 'published' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-neutral-100 text-neutral-500'
              }`}>
                {course.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <span className="ml-2 text-xs text-neutral-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> 
                Updated {formatDate(course.updatedAt)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-emerald-700 transition-colors mb-1">{course.title}</h3>
          </div>
          <div className="dropdown relative">
            <button className="p-1.5 rounded-full hover:bg-neutral-100">
              <MoreHorizontal className="h-4 w-4 text-neutral-500" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Users className="h-3.5 w-3.5 text-neutral-500 mr-1.5" />
              <span className="text-xs text-neutral-500">Students</span>
            </div>
            <div className="font-semibold text-neutral-900">{course.students}</div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Star className="h-3.5 w-3.5 text-neutral-500 mr-1.5" />
              <span className="text-xs text-neutral-500">Rating</span>
            </div>
            <div className="font-semibold text-neutral-900">
              {course.rating > 0 ? (
                <div className="flex items-center">
                  {course.rating}
                  <Star className="h-3.5 w-3.5 text-amber-500 ml-1 fill-amber-500" />
                </div>
              ) : (
                <span className="text-neutral-400">-</span>
              )}
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <DollarSign className="h-3.5 w-3.5 text-neutral-500 mr-1.5" />
              <span className="text-xs text-neutral-500">Revenue</span>
            </div>
            <div className="font-semibold text-neutral-900">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${getRevenueColorClass(course.revenue)}`}>
                {formatCurrency(course.revenue)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
          <div className="text-xs text-neutral-500">
            ID: {course.id}
          </div>
          <Link href={`/courses/${course.id}`}>
            <button className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              View Course
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 