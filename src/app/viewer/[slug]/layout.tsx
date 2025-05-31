'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { coursesApi, Course } from '@/lib/utils/api-client';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import CourseSidebar from './components/CourseSidebar';
import { Menu, X } from 'lucide-react';
import { use } from 'react';

// Type declaration for window with course data
declare global {
  interface Window {
    __COURSE_DATA__?: Course;
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
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Determine if we're on a lesson page
  const isLessonPage = pathname.includes('/lesson/');
  
  // Get the current lesson ID from the URL if we're on a lesson page
  const currentLessonId = isLessonPage 
    ? pathname.split('/lesson/')[1] 
    : '';
  
  // Load course data
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
        
        // Share course data with children through window object
        window.__COURSE_DATA__ = courseData;
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load course:', error);
        setError('Course not found or unavailable');
        setLoading(false);
      }
    }

    loadCourse();
    
    // Cleanup function to remove the course data when the component unmounts
    return () => {
      delete window.__COURSE_DATA__;
    };
  }, [courseSlug]);
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading course..." />;
  }

  // Error state
  if (error || !course) {
    return (
      <ErrorState 
        title="Course Not Found"
        message={error || 'This course does not exist or is currently unavailable.'}
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
        />
      </div>
      
      {/* Main content - scrollable independently */}
      <div className="lg:flex-1 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 