'use client';

import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2, BookOpen, RefreshCcw } from 'lucide-react';
import { useAllCourses, useCreateCourse } from '@/lib/api';
import { CourseCard } from '@/components/features/courses/course-card';
import { Button } from '@/components/ui/potatix/Button';
import type { Course, CreateCourseData } from '@/lib/types/api';
import { useState } from 'react';
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';

// Define the response type based on our API structure
interface CourseResponse {
  course: Course;
}

export default function CoursesPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  // Use React Query hook directly instead of store
  const {
    data: courses = [],
    isLoading,
    error,
    refetch
  } = useAllCourses();
  
  // Course creation mutation
  const { mutate: createCourse, isPending: isCreatingCourse } = useCreateCourse();
  
  // Handle creating a new course directly
  const handleCreateCourse = () => {
    if (isCreating || isCreatingCourse) return;
    
    setIsCreating(true);
    
    // Generate a random name with unique-names-generator
    const randomName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      style: 'capital',
      separator: ' '
    });
    
    // Create course data with default values
    const courseData: CreateCourseData = {
      title: `${randomName} Course`,
      description: "Click to edit course details",
      price: 0,
      status: 'draft'
    };
    
    // Create the course and then navigate to its edit page
    createCourse(courseData, {
      onSuccess: (data: unknown) => {
        const response = data as CourseResponse;
        // The response from createCourse should contain the new course ID
        if (response && response.course && response.course.id) {
          router.push(`/courses/${response.course.id}/edit`);
        } else {
          console.error('Course created but no ID returned');
          setIsCreating(false);
        }
      },
      onError: (error) => {
        console.error('Failed to create course:', error);
        setIsCreating(false);
        alert('Failed to create course. Please try again.');
      }
    });
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header Section */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-slate-900">
              Courses
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Create and manage your course content. Each course can contain multiple lessons with videos.
            </p>
          </div>
          
          <Button
            type="primary"
            size="small"
            icon={<PlusCircle className="h-3.5 w-3.5" />}
            onClick={handleCreateCourse}
            disabled={isCreating || isCreatingCourse}
          >
            {isCreating || isCreatingCourse ? 'Creating...' : 'New Course'}
          </Button>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="border border-red-200 bg-red-50 rounded-md p-4 my-6">
          <div className="flex gap-3">
            <RefreshCcw className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">Failed to load courses</h3>
              <p className="text-sm text-red-600 mb-3">
                We couldn&apos;t load your courses. This could be due to a network issue or server problem.
              </p>
              <Button 
                type="danger"
                size="small"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && courses.length === 0 && (
        <div className="border border-dashed border-slate-200 rounded-md p-8 bg-slate-50 my-6">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-4">
              <BookOpen className="h-5 w-5 text-slate-500" />
            </div>
            
            <h3 className="text-sm font-medium text-slate-900 mb-2">No courses yet</h3>
            
            <p className="text-sm text-slate-500 mb-6">
              Get started by creating your first course. Add lessons, upload videos, and share your knowledge.
            </p>
            
            <Button
              type="primary"
              size="small"
              icon={<PlusCircle className="h-3.5 w-3.5" />}
              onClick={handleCreateCourse}
              disabled={isCreating || isCreatingCourse}
            >
              {isCreating || isCreatingCourse ? 'Creating...' : 'Create Your First Course'}
            </Button>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {!isLoading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          
          {/* "Create New" Card */}
          <div 
            onClick={isCreating || isCreatingCourse ? undefined : handleCreateCourse}
            className={`cursor-pointer group flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all min-h-[220px] ${(isCreating || isCreatingCourse) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {isCreating || isCreatingCourse ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <PlusCircle className="h-5 w-5 text-white" />
                )}
              </div>
              <h3 className="text-sm font-medium text-slate-900 mb-1">
                {isCreating || isCreatingCourse ? 'Creating course...' : 'Create a new course'}
              </h3>
              <p className="text-xs text-slate-500">
                {isCreating || isCreatingCourse ? 'Please wait' : 'Add another course to your catalog'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 