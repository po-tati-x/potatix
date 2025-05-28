'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Loader2, BookOpen, RefreshCcw } from 'lucide-react';
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
  
  // Debug what data we're actually getting
  useEffect(() => {
    if (courses.length > 0) {
      console.log('DEBUG COURSES DATA:', JSON.stringify(courses, null, 2));
    }
  }, [courses]);

  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Your Courses</h1>
            <p className="text-sm text-neutral-500">
              Manage your created courses or create a new one
            </p>
          </div>
          <div className="flex gap-3">
            {error && (
              <button 
                onClick={fetchCourses}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50"
                disabled={loading}
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            )}
            <Link href="/courses/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4" />
                <span>Create Course</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Course List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchCourses}
              className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700"
            >
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
            <BookOpen className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
            <p className="text-lg font-medium text-neutral-700 mb-2">No courses yet</p>
            <p className="text-sm text-neutral-500 mb-6">
              Create your first course to start teaching
            </p>
            <Link href="/courses/new">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                Create Your First Course
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 