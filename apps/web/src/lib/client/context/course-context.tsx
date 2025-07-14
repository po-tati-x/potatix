'use client';

import { createContext, useContext, useMemo, ReactNode, useState } from 'react';
import type { Course } from '@/lib/shared/types/courses';
import { useEnrollment } from '@/lib/client/hooks/use-enrollment';
import { useCourseBySlug } from '@/lib/client/hooks/use-courses';
import { useSession } from '@/lib/auth/auth';

interface CourseContextValue {
  // Course data
  course: Course | undefined;
  isLoading: boolean;
  error: Error | undefined;

  // Auth state
  isAuthenticated: boolean;

  // Enrollment state
  isEnrolled: boolean;
  enrollmentStatus: 'active' | 'pending' | 'rejected' | undefined;
  isEnrolling: boolean;
  enroll: () => Promise<void>;

  // Viewer state
  isViewerMode: boolean;
  completedLessons: string[];

  // UI state
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;

  // Current lesson
  currentLessonId: string;
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export function CourseProvider({ 
  children, 
  courseSlug,
  currentLessonId = '',
}: { 
  children: ReactNode;
  courseSlug: string;
  currentLessonId?: string;
}) {
  // UI state
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen((s) => !s);
  const toggleSidebarCollapsed = () => setSidebarCollapsed((s) => !s);

  // Auth state
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  // Course data
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useCourseBySlug(courseSlug);

  // Course may be undefined until fetch completes
  const course = courseData;

  // Enrollment state
  const {
    isEnrolled,
    enrollmentStatus,
    isLoading: isEnrollmentLoading,
    isEnrolling,
    enroll,
  } = useEnrollment(courseSlug);

  // Derived state
  const isViewerMode = isEnrolled && enrollmentStatus === "active";
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Course data
    course,
    isLoading: courseLoading || isEnrollmentLoading,
    error: courseError ?? undefined,
    
    // Auth state
    isAuthenticated,
    
    // Enrollment state
    isEnrolled,
    enrollmentStatus: enrollmentStatus ?? undefined,
    isEnrolling,
    enroll,
    
    // Viewer state
    isViewerMode,
    completedLessons: [] as string[],
    
    // UI state
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    
    // Current lesson
    currentLessonId,
  }), [
    course, courseLoading, courseError,
    isAuthenticated,
    isEnrolled, enrollmentStatus, isEnrolling, enroll,
    isViewerMode,
    isSidebarCollapsed, isMobileSidebarOpen,
    currentLessonId, isEnrollmentLoading
  ]);

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourseContext() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
} 