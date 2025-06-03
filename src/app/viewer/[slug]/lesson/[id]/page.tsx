'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Course, Lesson } from '@/lib/types/api';
import LoadingState from '../../components/loading-state';
import ErrorState from '../../components/error-state';
import LessonContent from '../../components/lesson-content';
import { use } from 'react';

interface LessonViewerProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

// Extend Window interface to include our course data
declare global {
  interface Window {
    __COURSE_DATA__?: Course;
  }
}

export default function LessonViewerPage({ params }: LessonViewerProps) {
  const router = useRouter();
  const { slug: courseSlug, id: lessonId } = use(params);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // Get course data from the shared window object
  const course = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.__COURSE_DATA__;
  }, []);
  
  // Load lesson data
  useEffect(() => {
    async function findLesson() {
      try {
        setLoading(true);
        setError(null);
        
        if (!course || !course.lessons) {
          setError('Course data not available');
          setLoading(false);
          return;
        }

        // Find the requested lesson from the course data
        const foundLesson = course.lessons.find(l => l.id === lessonId);
        
        if (!foundLesson) {
          setError('Lesson not found');
          setLoading(false);
          return;
        }
        
        // Check if lesson is accessible (has video ID)
        if (!foundLesson.videoId) {
          setError('This lesson is not available in the demo version');
          setLoading(false);
          return;
        }
        
        setLesson(foundLesson);
      } catch (err) {
        setError('Failed to load lesson. Please try again.');
        console.error('Lesson load error:', err);
      } finally {
        setLoading(false);
      }
    }

    // Reset state when navigating to a new lesson
    setVideoError(null);
    findLesson();
  }, [course, lessonId]);
  
  // Get the current lesson index
  const currentLessonIndex = useMemo(() => {
    if (!lesson || !course?.lessons) return -1;
    return course.lessons.findIndex(l => l.id === lesson.id);
  }, [lesson, course?.lessons]);
  
  // Get next lesson if available
  const nextLesson = useMemo(() => {
    if (!course?.lessons || currentLessonIndex < 0 || currentLessonIndex >= course.lessons.length - 1) {
      return null;
    }
    return course.lessons[currentLessonIndex + 1];
  }, [course?.lessons, currentLessonIndex]);
  
  // Navigate to next/previous lessons
  const goToNextLesson = useCallback(() => {
    if (!nextLesson) return;
    router.push(`/viewer/${courseSlug}/lesson/${nextLesson.id}`);
  }, [nextLesson, router, courseSlug]);
  
  const goToPrevLesson = useCallback(() => {
    if (!course?.lessons || currentLessonIndex <= 0) return;
    const prevLesson = course.lessons[currentLessonIndex - 1];
    router.push(`/viewer/${courseSlug}/lesson/${prevLesson.id}`);
  }, [course?.lessons, currentLessonIndex, router, courseSlug]);
  
  // Handle video errors
  const handleVideoError = useCallback(() => {
    setVideoError('Failed to load video. Please try again.');
  }, []);

  const resetVideoError = useCallback(() => {
    setVideoError(null);
  }, []);
  
  // Loading state
  if (loading) {
    return <LoadingState message="Loading lesson..." />;
  }

  // Error state
  if (error || !course || !lesson) {
    return (
      <ErrorState 
        title="Lesson Not Available"
        message={error || 'This lesson does not exist or is currently unavailable.'}
        buttonText="Back to Course"
        buttonAction={() => router.push(`/viewer/${courseSlug}`)}
      />
    );
  }

  const totalLessons = course.lessons?.length || 0;

  return (
    <LessonContent
      lesson={lesson}
      currentIndex={currentLessonIndex}
      totalLessons={totalLessons}
      nextLesson={nextLesson}
      courseSlug={courseSlug}
      videoError={videoError}
      onPrevLesson={goToPrevLesson}
      onNextLesson={goToNextLesson}
      onVideoError={handleVideoError}
      onResetError={resetVideoError}
    />
  );
} 