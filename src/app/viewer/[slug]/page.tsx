'use client';

import { useEffect, useState } from 'react';
import { coursesApi, Course } from '@/lib/utils/api-client';
import { use } from 'react';

interface CourseViewerProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseViewerPage({ params }: CourseViewerProps) {
  // Use React.use to unwrap the params Promise in Next.js 15
  const resolvedParams = use(params);
  const courseSlug = resolvedParams.slug;
  
  console.log('[Viewer] Using slug from URL params:', courseSlug);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!courseSlug) {
        setError('No course specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`[Viewer] Loading course with slug: ${courseSlug}`);
        const courseData = await coursesApi.getBySlug(courseSlug);
        console.log(`[Viewer] Course data:`, courseData);
        setCourse(courseData);
        setLoading(false);
      } catch (err) {
        console.error('[Viewer] Failed to load course:', err);
        setError('Failed to load course. This course may not exist or you may not have access.');
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseSlug]);

  // Debug info - REMOVE FOR PRODUCTION
  const debugInfo = (
    <div className="fixed bottom-2 right-2 bg-black/80 text-white text-xs p-2 rounded z-50">
      <div><strong>Subdomain:</strong> {courseSlug || 'none'}</div>
      <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
      <div><strong>Error:</strong> {error || 'none'}</div>
      {course && <div><strong>Course:</strong> {course.title}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-t-2 border-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading course...</p>
        </div>
        {debugInfo}
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Course Not Found</h1>
          <p className="text-neutral-600 mb-6">{error || 'This course does not exist or is currently unavailable.'}</p>
          <a href="http://potatix.com:5005" className="text-emerald-600 hover:underline">
            Return to Potatix
          </a>
        </div>
        {debugInfo}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 truncate">{course.title}</h1>
            {/* Course navigation can go here */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with lesson list */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Course Content</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {course.lessons?.map((lesson) => (
                <li key={lesson.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="text-xs text-gray-500 mt-1">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {!course.lessons?.length && (
                <li className="p-4 text-sm text-gray-500">
                  This course has no lessons yet.
                </li>
              )}
            </ul>
          </div>
          
          {/* Main content area - video player would go here */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">About This Course</h2>
              <div className="prose max-w-none">
                <p>{course.description || 'No description available.'}</p>
              </div>
              
              {/* Course details section */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Course Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Lessons:</span>
                    <span className="ml-2 text-gray-900">{course.lessons?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Video player would be added here once lessons are implemented */}
              <div className="mt-8 bg-gray-100 rounded-lg p-12 flex items-center justify-center">
                <p className="text-gray-500">Select a lesson to start learning</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {debugInfo}
    </div>
  );
} 