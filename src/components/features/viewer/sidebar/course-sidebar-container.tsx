'use client';

import { Course } from '@/lib/types/api';
import { PanelLeftClose, PanelLeft, Book } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/potatix/Button';
import { motion } from 'framer-motion';
import ModuleList from './module-list';
import EnrollmentStatus from './enrollment-status';
import SidebarFooter from './sidebar-footer';
import { useCourseProgress } from '@/lib/stores/viewer';

// Animation variants - defined outside to prevent recreation on render
const sidebarVariants = {
  expanded: { width: '20rem' },
  collapsed: { width: '5rem' }
};

interface CourseSidebarProps {
  course: Course;
  currentLessonId: string;
  courseSlug: string;
  isAuthenticated?: boolean;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
  enrollmentStatus?: 'active' | 'pending' | 'rejected' | null;
  onEnroll?: () => Promise<void>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function CourseSidebar({
  course,
  currentLessonId,
  isAuthenticated = false,
  isEnrolled = false,
  isEnrolling = false,
  enrollmentStatus = null,
  onEnroll,
  isCollapsed = false,
  onToggleCollapse
}: CourseSidebarProps) {
  // Get course progress
  const courseProgress = useCourseProgress();
  
  // Count available lessons
  const availableLessons = course.lessons?.filter(lesson => lesson.videoId)?.length || 0;
  const totalLessons = course.lessons?.length || 0;

  // Determine if the sidebar should be locked (not enrolled or pending approval)
  const isLocked = !isEnrolled || (enrollmentStatus === 'pending') || (enrollmentStatus === 'rejected');

  // Should show subscription CTA - only show if NOT enrolled with active status
  const shouldShowSubscriptionCTA = !isEnrolled || enrollmentStatus !== 'active';

  return (
    <motion.div
      className="h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden"
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header section */}
      {renderHeader()}
      
      {/* Course title - hidden when collapsed */}
      {!isCollapsed && renderCourseInfo()}
      
      {/* Enrollment Status - hidden when collapsed */}
      {!isCollapsed && (
        <EnrollmentStatus 
          isEnrolled={isEnrolled}
          enrollmentStatus={enrollmentStatus}
          isEnrolling={isEnrolling}
          isAuthenticated={isAuthenticated}
          onEnroll={onEnroll}
          coursePrice={course.price}
        />
      )}
      
      {/* Lesson list container - hiding scrollbar */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'py-2' : 'py-3'} scrollbar-hide`}>
        <ModuleList 
          course={course}
          currentLessonId={currentLessonId}
          isCollapsed={isCollapsed}
          isLocked={isLocked}
        />
      </div>
      
      {/* Footer with subscription CTA */}
      {!isCollapsed && shouldShowSubscriptionCTA && <SidebarFooter />}
    </motion.div>
  );
  
  // Header with toggle button
  function renderHeader() {
    if (isCollapsed) {
      return (
        <div className="border-b border-slate-200">
          {/* Toggle button on top with better padding */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="w-full text-slate-600 hover:text-emerald-600 transition-colors p-4 flex items-center justify-center hover:bg-slate-50"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          
          {/* Active course status - progress indicator */}
          {isEnrolled && enrollmentStatus === 'active' && (
            <div className="p-3 border-t border-slate-200 flex flex-col items-center">
              <div className="relative w-8 h-8 mb-1">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100"></div>
                <svg viewBox="0 0 36 36" className="w-8 h-8 transform -rotate-90">
                  <circle 
                    cx="18" cy="18" r="16" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="2" 
                  />
                  <circle 
                    cx="18" cy="18" r="16" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2" 
                    strokeDasharray={`${(courseProgress / 100) * 100} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald-600">
                  {courseProgress}%
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Progress</span>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <Link href="/">
          <Button 
            type="text"
            size="tiny"
          >
            Course Overview
          </Button>
        </Link>
        
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
  
  // Course info section
  function renderCourseInfo() {
    return (
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900 mb-1 line-clamp-2">{course.title}</h2>
        <div className="flex items-center text-xs text-slate-500">
          <Book className="h-3.5 w-3.5 mr-1.5" />
          <span>{availableLessons} of {totalLessons} lessons available</span>
        </div>
      </div>
    );
  }
} 