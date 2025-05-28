'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, BookOpen, Play, Lock } from 'lucide-react';
import { useCourseDetailStore } from '@/lib/stores/courseDetailStore';
import { Lesson as CourseStoreLesson } from '@/lib/stores/courseStore';
import { Lesson } from '@/lib/utils/api-client';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // Get state and actions from store
  const {
    course,
    loading,
    error,
    expandedLessons,
    fetchCourse,
    toggleLesson,
    deleteCourse,
  } = useCourseDetailStore();
  
  // Load course on component mount
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);
  
  // Debug course data
  useEffect(() => {
    if (course) {
      console.log('DEBUG COURSE DETAIL:', JSON.stringify(course, null, 2));
    }
  }, [course]);
  
  const handleDeleteCourse = async () => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const success = await deleteCourse();
      if (success) {
        router.push('/courses');
      } else {
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (error || !course) {
    return (
      <div className="min-h-full w-full py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <BookOpen className="h-16 w-16 mx-auto text-neutral-400 mb-6" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Course Not Found</h1>
          <p className="text-neutral-600 mb-8">
            {error || "The course you're looking for doesn't exist or you don't have access to it."}
          </p>
            <Link href="/courses">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                Return to Courses
              </button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header with back button and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <Link href="/courses" className="text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-semibold text-neutral-900">{course.title}</h1>
            <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 capitalize">
              {course.status}
              </span>
            </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="flex items-center space-x-2 px-3 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
              onClick={() => router.push(`/courses/${courseId}/edit`)}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            
            <button 
              className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
              onClick={handleDeleteCourse}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
                </button>
          </div>
        </div>
        
        {/* Course details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Course info */}
          <div className="md:col-span-2 space-y-6">
            {/* Course image */}
            <div className="h-60 bg-neutral-100 rounded-lg flex items-center justify-center">
              {course.imageUrl ? (
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="h-16 w-16 text-neutral-400" />
              )}
            </div>
            
            {/* Course description */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-3">About this course</h2>
              <p className="text-neutral-700 whitespace-pre-line">
                {course.description || "No description provided."}
              </p>
            </div>
            
            {/* Lesson list */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-lg">
                <div className="border-b border-neutral-200 px-6 py-4">
                  <h2 className="text-lg font-medium text-neutral-900">Course Content</h2>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <li key={lesson.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="mr-4 flex-shrink-0 text-neutral-500 text-sm">
                            {index + 1}.
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-md font-medium text-neutral-900">{lesson.title}</h3>
                            {lesson.description && (
                              <p className="text-sm text-neutral-500 mt-1">{lesson.description}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            {lesson.videoId ? (
                              <Play className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-neutral-400" />
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Course sidebar */}
          <div>
            {/* Course stats */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Price</h3>
                  <p className="text-xl font-semibold text-neutral-900">${course.price.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Status</h3>
                  <p className="text-xl font-semibold text-neutral-900 capitalize">{course.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Created</h3>
                  <p className="text-xl font-semibold text-neutral-900">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Lessons</h3>
                  <p className="text-xl font-semibold text-neutral-900">{course.lessons?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 