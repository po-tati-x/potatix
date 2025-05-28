'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, File, Loader2, Clock, Calendar } from 'lucide-react';
import { coursesApi, type Lesson } from '@/lib/utils/api-client';
import MuxPlayer from '@mux/mux-player-react';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchData() {
      if (!courseId || !lessonId) {
        setError('Invalid course or lesson ID');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch lesson data
        const lessonData = await coursesApi.lessons.getById(courseId, lessonId);
        setLesson(lessonData);
        
        // Fetch course name
        const courseData = await coursesApi.getById(courseId);
        setCourseName(courseData.title);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [courseId, lessonId]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !lesson) {
    return (
      <div className="min-h-full w-full py-12 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm text-center">
          <File className="h-16 w-16 mx-auto text-gray-400 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Lesson Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || "The lesson you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link href={`/courses/${courseId}`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Return to Course
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Check if the lesson has a video
  const hasVideo = !!lesson.videoId;
  
  return (
    <div className="min-h-full w-full bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header with navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <Link href={`/courses/${courseId}`} className="text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm text-gray-500">{courseName}</p>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{lesson.title}</h1>
            </div>
          </div>
          
          <Link href={`/courses/${courseId}/lessons/${lessonId}/edit`}>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
              <Edit className="h-4 w-4" />
              <span>Edit Lesson</span>
            </button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video player in main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video player */}
            <div className="aspect-video bg-black rounded-lg shadow-md overflow-hidden">
              {hasVideo ? (
                <MuxPlayer
                  playbackId={lesson.videoId || ''}
                  streamType="on-demand"
                  metadata={{
                    video_id: lessonId,
                    video_title: lesson.title || 'Lesson',
                    viewer_user_id: 'anonymous'
                  }}
                  style={{
                    height: '100%',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: '100%',
                    '--controls-backdrop-color': 'rgba(0, 0, 0, 0.7)'
                  } as React.CSSProperties}
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gray-800 text-white">
                  <File className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl font-medium text-gray-200">No video available</p>
                  <p className="text-gray-400 mt-2 text-sm">
                    Add a video by editing this lesson.
                  </p>
                </div>
              )}
            </div>
            
            {/* Lesson description */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <File className="h-5 w-5 mr-2" />
                About this lesson
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {lesson.description || "No description provided for this lesson."}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar with metadata */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lesson Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last updated</p>
                    <p className="text-gray-700">
                      {lesson.updatedAt 
                        ? new Date(lesson.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Not available'}
                    </p>
                  </div>
                </div>
                
                {lesson.order && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Lesson order</p>
                      <p className="text-gray-700">#{lesson.order}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href={`/courses/${courseId}`}>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Return to Course
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 