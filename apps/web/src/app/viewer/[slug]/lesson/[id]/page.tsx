'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/features/viewer/loading-state';
import ErrorState from '@/components/features/viewer/error-state';
import { LessonViewer } from '@/components/features/viewer/lesson-viewer/lesson-viewer';
import { use } from 'react';
import { useViewerStore } from '@/lib/stores/viewer';
import { useLessonNavigation } from '@/hooks/use-lesson-navigation';

interface LessonViewerProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default function LessonViewerPage({ params }: LessonViewerProps) {
  const router = useRouter();
  const { slug: courseSlug, id: lessonId } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get course data from store
  const { 
    currentCourse: course, 
    setCourseSlug
  } = useViewerStore();
  
  // Use our custom hooks for navigation
  const navigation = useLessonNavigation({
    currentLessonId: lessonId,
    courseSlug
  });
  
  // Set course slug in the store to ensure it's available
  useEffect(() => {
    if (courseSlug) {
      setCourseSlug(courseSlug);
    }
  }, [courseSlug, setCourseSlug]);
  
  // Find the current lesson from course data
  const lesson = navigation.currentLessonIndex >= 0 && course?.lessons
    ? course.lessons[navigation.currentLessonIndex]
    : null;
  
  // Validate lesson availability
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      if (!course) {
        setError('Course data not available');
        return;
      }

      if (!lesson) {
        setError('Lesson not found');
        return;
      }
      
      // Check if lesson is accessible (has video ID)
      if (!lesson.videoId) {
        setError('This lesson is not available in the demo version');
        return;
      }
    } catch (err) {
      setError('Failed to load lesson. Please try again.');
      console.error('Lesson load error:', err);
    } finally {
      setLoading(false);
    }
  }, [course, lesson]);
  
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

  // Render our new simplified component
  return (
    <LessonViewer
      lesson={lesson}
      currentIndex={navigation.currentLessonIndex}
      totalLessons={navigation.totalLessons}
      nextLesson={navigation.nextLesson}
      courseSlug={courseSlug}
    />
  );
} 