'use client';

import { CourseType } from './types';
import { BookOpen, Clock, Users as UsersIcon } from 'lucide-react';

interface StatsCardsProps {
  courses: CourseType[];
}

export function StatsCards({ courses }: StatsCardsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Sort courses by updatedAt to get most recently updated
  const mostRecentlyUpdated = [...courses].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  // Calculate total students
  const totalStudents = courses.reduce((total, course) => total + course.students, 0);
  
  // Calculate published percentage
  const publishedPercentage = courses.length 
    ? Math.round((courses.filter(c => c.published).length / courses.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Courses Card */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-neutral-500">Total Courses</p>
            <h3 className="text-2xl font-semibold mt-1 text-neutral-900">{courses.length}</h3>
          </div>
          <div className="bg-blue-100 p-2 rounded-md">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="flex items-center mt-4 text-xs text-neutral-500">
          <div className="w-full bg-neutral-100 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${publishedPercentage}%` }}
            />
          </div>
          <span className="ml-2">{publishedPercentage}% Published</span>
        </div>
      </div>
      
      {/* Total Students Card */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-neutral-500">Total Students</p>
            <h3 className="text-2xl font-semibold mt-1 text-neutral-900">
              {totalStudents.toLocaleString()}
            </h3>
          </div>
          <div className="bg-amber-100 p-2 rounded-md">
            <UsersIcon className="h-5 w-5 text-amber-600" />
          </div>
        </div>
        <div className="mt-4 text-xs grid grid-cols-5 gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="h-1.5 rounded-full bg-amber-200" 
              style={{ opacity: i < 3 ? 1 - (i * 0.2) : 0.2 }} 
            />
          ))}
        </div>
      </div>
      
      {/* Last Updated Card */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-neutral-500">Last Updated</p>
            <h3 className="text-2xl font-semibold mt-1 text-neutral-900">
              {mostRecentlyUpdated ? formatDate(mostRecentlyUpdated.updatedAt) : 'N/A'}
            </h3>
          </div>
          <div className="bg-emerald-100 p-2 rounded-md">
            <Clock className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Course: {mostRecentlyUpdated ? mostRecentlyUpdated.title : 'None'}
        </p>
      </div>
    </div>
  );
} 