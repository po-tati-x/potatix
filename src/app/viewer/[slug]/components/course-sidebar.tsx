'use client';

import { Course, Lesson } from '@/lib/types/api';
import { Lock, Play, Book, X, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/potatix/Button';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface CourseSidebarProps {
  course: Course;
  currentLessonId: string;
  courseSlug: string;
  isAuthenticated?: boolean;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
  enrollmentStatus?: 'active' | 'pending' | 'rejected' | null;
  onEnroll?: () => Promise<void>;
}

// Extended lesson type with completed status for UI purposes
interface UILesson extends Lesson {
  completed?: boolean;
}

export default function CourseSidebar({ 
  course, 
  currentLessonId, 
  courseSlug,
  isAuthenticated = false,
  isEnrolled = false,
  isEnrolling = false,
  enrollmentStatus = null,
  onEnroll
}: CourseSidebarProps) {
  
  const router = useRouter();
  const [loading, setIsLoading] = useState(false);

  // Count available lessons
  const availableLessons = course.lessons?.filter((lesson: Lesson) => lesson.videoId)?.length || 0;
  const totalLessons = course.lessons?.length || 0;
  
  // Handle enrollment or auth redirect
  const handleEnroll = async () => {
    if (isEnrolling) return;
    
    // If not authenticated, redirect to auth page
    if (!isAuthenticated) {
      router.push(`/viewer/${courseSlug}/auth`);
      return;
    }
    
    // If we have an external handler, use it
    if (onEnroll) {
      try {
        await onEnroll();
        // Don't assume immediate success, will be updated on page reload
      } catch (error) {
        console.error('Failed to enroll in course:', error);
        toast.error('Failed to enroll in course. Please try again.');
      }
      return;
    }
    
    // Fallback to direct API call if no handler provided
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/courses/enrollment', {
        courseSlug
      });
      
      // Check enrollment status
      if (response.data.enrollment.status === 'pending') {
        toast.success('Enrollment request submitted. Waiting for instructor approval.');
      } else {
        toast.success('Successfully enrolled in this course!');
      }
      
      // Refresh the page to update enrollment status
      window.location.reload();
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      toast.error('Failed to enroll in course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Define our module interface with optional properties
  interface UIModule {
    id: string;
    title: string;
    description: string | undefined;
    order: number;
    courseId: string;
    lessons?: UILesson[];
    createdAt: string;
    updatedAt: string;
  }

  // Use real course modules if available, otherwise use a fallback structure
  const moduleData = course.modules?.length 
    ? course.modules as unknown as UIModule[]
    : course.lessons?.length 
      ? [{ 
          id: 'default-module', 
          title: 'Course Content', 
          description: '', 
          order: 1,
          courseId: course.id,
          lessons: course.lessons as UILesson[],
          createdAt: course.createdAt,
          updatedAt: course.updatedAt || course.createdAt,
        }] 
      : [] as UIModule[];
  
  // Determine if the sidebar should be locked (not enrolled or pending approval)
  const isLocked = !isEnrolled || (enrollmentStatus === 'pending') || (enrollmentStatus === 'rejected');
  
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Header with back button */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <Link href="/">
          <Button 
            type="text"
            size="tiny"
          >
            Course Overview
          </Button>
        </Link>
        
        {/* Only shown on mobile but included for completeness */}
        <Button
          type="text"
          size="tiny"
          className="lg:hidden"
          icon={<X className="h-3.5 w-3.5" />}
        />
      </div>
      
      {/* Course title */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900 mb-1 line-clamp-2">{course.title}</h2>
        <div className="flex items-center text-xs text-slate-500">
          <Book className="h-3.5 w-3.5 mr-1.5" />
          <span>{availableLessons} of {totalLessons} lessons available</span>
        </div>
      </div>
      
      {/* Enrollment Status */}
      <div className="px-4 py-3 border-b border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <div className="h-4 w-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
            <span className="ml-2 text-xs text-slate-500">Checking status...</span>
          </div>
        ) : isEnrolled && enrollmentStatus === 'pending' ? (
          <div className="text-center py-2">
            <div className="bg-amber-50 border border-amber-100 rounded-md p-2 mb-2">
              <p className="text-xs text-amber-800">
                Your enrollment is pending approval from the instructor
              </p>
            </div>
          </div>
        ) : isEnrolled && enrollmentStatus === 'rejected' ? (
          <div className="text-center py-2">
            <div className="bg-red-50 border border-red-100 rounded-md p-2">
              <div className="flex items-center justify-center mb-1">
                <X className="h-3.5 w-3.5 text-red-500 mr-1" />
                <p className="text-xs font-medium text-red-800">
                  Enrollment Rejected
                </p>
              </div>
              <p className="text-xs text-red-700">
                Your enrollment request was not approved. Please contact the instructor for more information.
              </p>
            </div>
          </div>
        ) : isEnrolled && enrollmentStatus === 'active' ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-700">Your progress</span>
              <span className="text-xs text-slate-500">25% complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '25%' }} />
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xs text-slate-700 mb-2">
              {isAuthenticated 
                ? course.price > 0
                  ? `Enrollment requires approval (${course.price > 0 ? `${course.price}$` : 'Free'})`
                  : "You need to enroll to access this course"
                : "Sign in to access this course"}
            </p>
            <Button
              type="primary"
              size="small"
              className="w-full justify-center"
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling 
                ? 'Enrolling...' 
                : isAuthenticated 
                  ? course.price > 0 ? 'Request Enrollment' : 'Enroll Now (Free)' 
                  : 'Sign in to continue'}
            </Button>
          </div>
        )}
      </div>
      
      {/* Scrollable lesson list */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4">
          <div className="space-y-4">
            {moduleData.map((module: UIModule) => {
              const moduleLessons = module.lessons || [];
              const availableModuleLessons = moduleLessons.filter((lesson: UILesson) => lesson.videoId)?.length || 0;
              
              return (
                <div key={module.id} className="space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm text-slate-900">{module.title}</h4>
                    <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {`${availableModuleLessons} of ${moduleLessons.length}`}
                    </div>
                  </div>
                  
                  <ul className="space-y-0.5">
                    {moduleLessons.map((courseLesson: UILesson) => {
                      const isCurrentLesson = courseLesson.id === currentLessonId;
                      // Lock lessons if not enrolled or if lesson has no video
                      const isLessonLocked = isLocked || !courseLesson.videoId;
                      
                      if (isLessonLocked) {
                        return (
                          <li key={courseLesson.id} className="relative">
                            <div className="flex items-center py-2 px-3 text-sm text-slate-400 hover:bg-slate-50 rounded-md">
                              <Lock className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                              <span className="line-clamp-1">{courseLesson.title}</span>
                            </div>
                          </li>
                        );
                      }
                      
                      return (
                        <li key={courseLesson.id} className="relative">
                          <Link 
                            href={`/lesson/${courseLesson.id}`}
                            className={`flex items-center py-2 px-3 text-sm rounded-md
                              ${isCurrentLesson 
                                ? 'bg-emerald-50 text-emerald-600 font-medium border-l-2 border-emerald-500 pl-2.5' 
                                : 'text-slate-700 hover:bg-slate-50'
                              }`}
                          >
                            {isCurrentLesson ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mr-2">
                                <Play className="h-3 w-3 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mr-2">
                                <Play className="h-3 w-3 text-slate-500" />
                              </div>
                            )}
                            
                            <span className="line-clamp-1 flex-1">{courseLesson.title}</span>
                            
                            {/* Using the completed property from our UILesson type */}
                            {courseLesson.completed && (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 ml-2 flex-shrink-0" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer with subscription CTA */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
          <p className="text-xs text-slate-700 mb-2">Unlock all course content with a Potatix subscription</p>
          <Link href="/pricing">
            <Button
              type="primary"
              size="small"
              className="w-full justify-center"
              iconRight={<ChevronRight className="h-3.5 w-3.5" />}
            >
              View Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 