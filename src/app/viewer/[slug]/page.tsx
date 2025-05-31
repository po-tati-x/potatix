'use client';

import { useMemo } from 'react';
import { use } from 'react';
import { Course } from '@/lib/utils/api-client';
import CourseOverview from './components/CourseOverview';

// Extend Window interface to include our course data
declare global {
  interface Window {
    __COURSE_DATA__?: Course;
  }
}

interface CourseViewerProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseViewerPage({ params }: CourseViewerProps) {
  const { slug: courseSlug } = use(params);
  
  // Get course data from window object (injected by layout or server)
  const course = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.__COURSE_DATA__;
    }
    return null;
  }, []);
  
  // Derived state for course statistics
  const lessonsCount = useMemo(() => course?.lessons?.length || 0, [course?.lessons]);
  const unlockedLessonsCount = useMemo(() => 
    course?.lessons?.filter(lesson => lesson.videoId)?.length || 0, 
    [course?.lessons]
  );
  
  // If no course data is available yet, show a loading state
  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading course...</p>
        </div>
      </div>
    );
  }
  
  return (
    <CourseOverview 
      course={course}
      unlockedLessonsCount={unlockedLessonsCount}
      totalLessonsCount={lessonsCount}
      courseSlug={courseSlug}
    />
  );
}