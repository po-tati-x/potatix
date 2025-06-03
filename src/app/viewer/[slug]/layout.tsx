'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCourseBySlug } from '@/lib/api';
import type { Course } from '@/lib/types/api';
import LoadingState from './components/loading-state';
import ErrorState from './components/error-state';
import CourseSidebar from './components/course-sidebar';
import { Menu, X } from 'lucide-react';
import { use } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import axios from 'axios';

// Type declaration for window with course data
declare global {
  interface Window {
    __COURSE_DATA__?: Course;
    __ENROLLMENT_STATUS__?: 'active' | 'pending' | 'rejected' | null;
  }
}

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseLayout({ children, params }: CourseLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { slug: courseSlug } = use(params);
  
  const { data: course, isLoading: courseLoading, error: courseError } = useCourseBySlug(courseSlug);
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'active' | 'pending' | 'rejected' | null>(null);
  const [isEnrollmentLoading, setIsEnrollmentLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  // Determine if we're on a lesson page
  const isLessonPage = pathname.includes('/lesson/');
  const isAuthPage = pathname.includes('/auth');
  
  // Get the current lesson ID from the URL if we're on a lesson page
  const currentLessonId = isLessonPage 
    ? pathname.split('/lesson/')[1] 
    : '';
  
  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: session } = await authClient.getSession();
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        setIsAuthenticated(false);
      }
    }
    
    checkAuth();
  }, []);
  
  // Check enrollment status when authenticated
  useEffect(() => {
    async function checkEnrollment() {
      if (!isAuthenticated || !courseSlug) {
        setIsEnrolled(false);
        setEnrollmentStatus(null);
        setIsEnrollmentLoading(false);
        return;
      }
      
      try {
        setIsEnrollmentLoading(true);
        const response = await axios.get(`/api/courses/enrollment?slug=${courseSlug}`);
        const isUserEnrolled = response.data.isEnrolled;
        setIsEnrolled(isUserEnrolled);
        
        // Also get enrollment status if enrolled
        if (isUserEnrolled && response.data.enrollment) {
          setEnrollmentStatus(response.data.enrollment.status);
        } else {
          setEnrollmentStatus(null);
        }
      } catch (error) {
        console.error('Failed to check enrollment status:', error);
        setIsEnrolled(false);
        setEnrollmentStatus(null);
      } finally {
        setIsEnrollmentLoading(false);
      }
    }
    
    checkEnrollment();
  }, [isAuthenticated, courseSlug]);
  
  // Enroll in the course
  const handleEnroll = async () => {
    if (isEnrolling) return;
    
    if (!isAuthenticated) {
      router.push(`/viewer/${courseSlug}/auth`);
      return;
    }
    
    try {
      setIsEnrolling(true);
      const response = await axios.post('/api/courses/enrollment', { courseSlug });
      setIsEnrolled(true);
      
      // Set the enrollment status from the response
      if (response.data.enrollment) {
        setEnrollmentStatus(response.data.enrollment.status);
      }
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    } finally {
      setIsEnrolling(false);
    }
  };
  
  // Share course data with children through window object
  useEffect(() => {
    if (course) {
      window.__COURSE_DATA__ = course;
      window.__ENROLLMENT_STATUS__ = enrollmentStatus;
    }
    
    // Cleanup function to remove the course data when the component unmounts
    return () => {
      delete window.__COURSE_DATA__;
      delete window.__ENROLLMENT_STATUS__;
    };
  }, [course, enrollmentStatus]);
  
  // If user is not enrolled and trying to access a restricted page (like a lesson),
  // redirect to the course overview page - THIS HOOK MUST BE BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    // Redirect only if:
    // 1. User is not enrolled OR enrollment status is pending/rejected
    // 2. Not on auth page
    // 3. Trying to access a lesson page
    // 4. Course data has loaded and enrollment status has been checked
    if (((!isEnrolled || enrollmentStatus === 'pending' || enrollmentStatus === 'rejected') && 
        !isAuthPage && 
        isLessonPage && 
        !courseLoading && 
        !isEnrollmentLoading)) {
      // Redirect to the ROOT URL of the subdomain, not the internal viewer path
      window.location.href = '/';
    }
  }, [isEnrolled, enrollmentStatus, isAuthPage, isLessonPage, courseLoading, isEnrollmentLoading]);
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Loading state
  if (courseLoading || isEnrollmentLoading) {
    return <LoadingState message="Loading course..." />;
  }

  // Error state
  if (courseError || !course) {
    return (
      <ErrorState 
        title="Course Not Found"
        message="This course does not exist or is currently unavailable."
        buttonText="Back to Homepage"
        buttonAction={() => router.push('/')}
      />
    );
  }

  // Success state - layout with sidebar and content
  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50">
      {/* Mobile header with menu toggle */}
      <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <h1 className="text-lg font-medium text-slate-900 truncate">{course.title}</h1>
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 text-slate-600 hover:text-emerald-600"
        >
          {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Sidebar - fixed on mobile, always visible on desktop */}
      <div className={`
        ${isMobileSidebarOpen ? 'block' : 'hidden'} 
        lg:block
        fixed lg:relative 
        inset-0 lg:inset-auto 
        z-10 lg:z-0
        w-full lg:w-80 
        h-screen
        lg:h-auto
        bg-white
        lg:border-r lg:border-slate-200
      `}>
        <CourseSidebar 
          course={course}
          currentLessonId={currentLessonId}
          courseSlug={courseSlug}
          isAuthenticated={isAuthenticated}
          isEnrolled={isEnrolled}
          onEnroll={handleEnroll}
          isEnrolling={isEnrolling}
          enrollmentStatus={enrollmentStatus}
        />
      </div>
      
      {/* Main content - scrollable independently */}
      <div className="lg:flex-1 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 