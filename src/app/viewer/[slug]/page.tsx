'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Course } from '@/lib/types/api';
import CourseOverview from './components/course-overview';
import axios from 'axios';

type EnrollmentStatus = 'active' | 'pending' | 'rejected' | null;

export default function CourseViewerPage() {
  const { slug: courseSlug } = useParams() as { slug: string };
  
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>(null);
  
  useEffect(() => {
    async function fetchCourseData() {
      try {
        setIsLoading(true);
        
        // Fetch course data
        const { data } = await axios.get(`/api/courses/slug/${courseSlug}`);
        
        if (!data?.course) {
          throw new Error('Course not found');
        }
        
        setCourse(data.course);
        
        // Try to get enrollment status if user is logged in
        try {
          const { data: enrollment } = await axios.get(`/api/courses/enrollment?slug=${courseSlug}`);
          setEnrollmentStatus(enrollment?.status || null);
        } catch {
          // User might not be logged in, no enrollment status
          setEnrollmentStatus(null);
        }
      } catch (error) {
        console.error(`Failed to load course "${courseSlug}":`, error);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCourseData();
  }, [courseSlug]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading course...</p>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-red-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-900">Course not found</p>
          <p className="mt-1 text-sm text-slate-500">We couldn&apos;t find the course you&apos;re looking for.</p>
        </div>
      </div>
    );
  }
  
  const lessonsCount = course.lessons?.length || 0;
  const unlockedLessonsCount = course.lessons?.filter(lesson => lesson.videoId)?.length || 0;
  
  return (
    <CourseOverview 
      course={course}
      unlockedLessonsCount={unlockedLessonsCount}
      totalLessonsCount={lessonsCount}
      courseSlug={courseSlug}
      enrollmentStatus={enrollmentStatus}
    />
  );
}