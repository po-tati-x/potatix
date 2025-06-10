'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import CourseOverview from '@/components/features/viewer/course-overview';
import { useViewerStore } from '@/lib/stores/viewer';
import { useCourseBySlug } from "@/lib/api/courses";
import LoadingState from '@/components/features/viewer/loading-state';
import ErrorState from '@/components/features/viewer/error-state';

export default function CourseViewerPage() {
  const { slug: courseSlug } = useParams() as { slug: string };
  
  // Get data from the store
  const { 
    currentCourse,
    enrollmentStatus,
    setCourse,
    setCourseSlug
  } = useViewerStore();
  
  // Fetch course data
  const { 
    data: course, 
    isLoading, 
    error 
  } = useCourseBySlug(courseSlug);
  
  // Update store when course data changes
  useEffect(() => {
    if (course) {
      setCourse(course);
      setCourseSlug(courseSlug);
    }
  }, [course, courseSlug, setCourse, setCourseSlug]);
  
  // Use the course from the store if available, otherwise use the one from the query
  const courseData = currentCourse || course;
  
  // Loading state
  if (isLoading && !courseData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <LoadingState message="Loading course..." />
      </div>
    );
  }
  
  // Error state
  if (error || !courseData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <ErrorState
          title="Course not found"
          message="We couldn't find the course you're looking for."
          buttonText="Back to Homepage"
          buttonAction={() => window.location.href = '/'}
        />
      </div>
    );
  }
  
  // Calculate lesson counts
  const lessonsCount = courseData.lessons?.length || 0;
  const unlockedLessonsCount = courseData.lessons?.filter(lesson => lesson.videoId)?.length || 0;
  
  // Success state
  return (
    <CourseOverview 
      course={courseData}
      unlockedLessonsCount={unlockedLessonsCount}
      totalLessonsCount={lessonsCount}
      courseSlug={courseSlug}
      enrollmentStatus={enrollmentStatus}
    />
  );
}