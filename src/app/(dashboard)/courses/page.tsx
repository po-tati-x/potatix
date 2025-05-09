'use client';

import { useState, useMemo } from 'react';

// Import refactored components
import { StatsGrid } from '@/components/features/courses/StatsGrid';
import { CoursesGrid } from '@/components/features/courses/CoursesGrid';
import { EmptyState } from '@/components/features/courses/EmptyState';
import { PageHeader } from '@/components/features/courses/PageHeader';
import { CourseFilters } from '@/components/features/courses/CourseFilters';

// Import types and data
import { Course } from '@/components/features/courses/types';
import { MOCK_COURSES } from '@/components/features/courses/data';

/**
 * Courses page shows stats and list of all courses with filtering
 */
export default function CoursesPage() {
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [currentFilter, setCurrentFilter] = useState('all');
  
  // Filter courses based on selected filter
  const filteredCourses = useMemo(() => {
    if (currentFilter === 'all') return courses;
    return courses.filter(course => 
      currentFilter === 'published' 
        ? course.status === 'published' 
        : course.status === 'draft'
    );
  }, [courses, currentFilter]);

  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="space-y-8">
        <PageHeader 
          title="Courses" 
          description="Create and manage your courses" 
        />
        
        <StatsGrid courses={courses} />
        
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-md font-medium text-neutral-900">Your Courses</h3>
            <CourseFilters 
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
            />
          </div>
          <CoursesGrid courses={filteredCourses} />
        </div>
        
        {courses.length === 0 && <EmptyState />}
      </div>
    </div>
  );
} 