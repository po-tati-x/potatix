'use client';

import { useEffect, useState, useCallback } from 'react';
import { coursesApi, Course } from '@/lib/utils/api-client';
import { use } from 'react';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

// Import components
import { CourseHeader } from './components/CourseHeader';
import { LessonList } from './components/LessonList';
import { LessonContent } from './components/LessonContent';
import { CourseOverview } from './components/CourseOverview';

interface CourseViewerProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseViewerPage({ params }: CourseViewerProps) {
  const resolvedParams = use(params);
  const courseSlug = resolvedParams.slug;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  const selectedLesson = selectedLessonId && course?.lessons 
    ? course.lessons.find(lesson => lesson.id === selectedLessonId) || null
    : null;
    
  const currentLessonIndex = selectedLessonId && course?.lessons 
    ? course.lessons.findIndex(lesson => lesson.id === selectedLessonId)
    : -1;
    
  const lessonsWithVideos = course?.lessons?.filter(lesson => !!lesson.videoId).length || 0;
  const totalLessons = course?.lessons?.length || 0;

  useEffect(() => {
    async function loadCourse() {
      if (!courseSlug) {
        setError('No course specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const courseData = await coursesApi.getBySlug(courseSlug);
        setCourse(courseData);
        
        if (courseData.lessons?.length) {
          setSelectedLessonId(courseData.lessons[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Course not found or unavailable');
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseSlug]);
  
  const selectLesson = useCallback((lessonId: string) => {
    setVideoError(null);
    setSelectedLessonId(lessonId);
  }, []);
  
  const goToNextLesson = useCallback(() => {
    if (!course?.lessons || currentLessonIndex < 0 || currentLessonIndex >= course.lessons.length - 1) return;
    selectLesson(course.lessons[currentLessonIndex + 1].id);
  }, [course?.lessons, currentLessonIndex, selectLesson]);
  
  const goToPrevLesson = useCallback(() => {
    if (!course?.lessons || currentLessonIndex <= 0) return;
    selectLesson(course.lessons[currentLessonIndex - 1].id);
  }, [course?.lessons, currentLessonIndex, selectLesson]);
  
  const handleVideoError = useCallback((e: any) => {
    setVideoError('Failed to load video. Please try again.');
  }, []);

  const resetVideoError = useCallback(() => {
    setVideoError(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-neutral-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="max-w-md text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Course Not Found</h1>
          <p className="text-neutral-600 mb-8">
            {error || 'This course does not exist or is currently unavailable.'}
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Homepage</span>
          </a>
        </div>
      </div>
    );
  }

  const lessons = course.lessons || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <CourseHeader title={course.title} totalLessons={totalLessons} />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lesson sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden sticky top-32">
              <div className="border-b border-neutral-200 px-6 py-4">
                <h2 className="font-semibold text-neutral-900">Course Content</h2>
                <p className="text-sm text-neutral-500 mt-1">{lessons.length} lessons</p>
              </div>
              
              <LessonList 
                lessons={lessons}
                selectedLessonId={selectedLessonId}
                onSelectLesson={selectLesson}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              {selectedLesson ? (
                <LessonContent 
                  lesson={selectedLesson}
                  currentIndex={currentLessonIndex}
                  totalLessons={totalLessons}
                  videoError={videoError}
                  onPrevLesson={goToPrevLesson}
                  onNextLesson={goToNextLesson}
                  onVideoError={handleVideoError}
                  onResetError={resetVideoError}
                />
              ) : (
                <div className="p-8">
                  <CourseOverview 
                    course={course}
                    totalLessons={totalLessons}
                    lessonsWithVideos={lessonsWithVideos}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}