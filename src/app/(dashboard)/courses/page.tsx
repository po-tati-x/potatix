'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Loader2, BookOpen, RefreshCcw, ArrowUpRight } from 'lucide-react';
import { useCoursesListStore } from '@/lib/stores/coursesListStore';
import { CourseCard } from '@/components/features/courses/CourseCard';

export default function CoursesPage() {
  // Get state and actions from store
  const {
    courses,
    loading,
    error,
    fetchCourses
  } = useCoursesListStore();

  // Load courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  return (
    <div className="min-h-full w-full py-12 px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-10 border-b border-neutral-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              Courses
            </h1>
            <p className="mt-1 text-neutral-500 max-w-2xl">
              Create and manage your course content. Each course can contain multiple lessons with videos.
            </p>
          </div>
          
          <Link 
            href="/courses/new"
            className="group flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium rounded-md hover:bg-neutral-800 transition-colors self-start md:self-center"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Course</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </Link>
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-neutral-300 mb-4" />
            <p className="text-neutral-500 animate-pulse">Loading your courses...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-md my-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-red-700 mb-4 font-medium">{error}</p>
            <p className="text-red-600 mb-6 max-w-md">
              We couldn't load your courses. This could be due to a network issue or server problem.
            </p>
            <button 
              onClick={fetchCourses}
              className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-neutral-200 rounded-lg p-12 bg-neutral-50">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-6">
              <BookOpen className="h-8 w-8 text-neutral-500" />
            </div>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No courses yet</h3>
            
            <p className="text-neutral-500 mb-8">
              Get started by creating your first course. Add lessons, upload videos, and share your knowledge.
            </p>
            
            <Link 
              href="/courses/new" 
              className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white font-medium rounded-md hover:bg-neutral-800 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create Your First Course</span>
            </Link>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
          
          {/* "Create New" Card */}
          <Link 
            href="/courses/new"
            className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300 transition-all min-h-[240px]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PlusCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">Create a new course</h3>
              <p className="text-sm text-neutral-500">
                Add another course to your catalog
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
} 