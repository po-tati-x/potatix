'use client';

import { Course } from '@/lib/utils/api-client';
import { ArrowLeft, Lock, Play, Book, X, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/potatix/Button';

interface CourseSidebarProps {
  course: Course;
  currentLessonId: string;
  courseSlug: string;
}

export default function CourseSidebar({ 
  course, 
  currentLessonId, 
  courseSlug 
}: CourseSidebarProps) {
  
  // Count available lessons
  const availableLessons = course.lessons?.filter(lesson => lesson.videoId)?.length || 0;
  const totalLessons = course.lessons?.length || 0;
  
  // Mock data for modules
  const modules = [
    {
      id: 'module-1',
      title: "Developer's Mindset",
      lessons: course.lessons?.slice(0, 4) || []
    },
    {
      id: 'module-2',
      title: "Web Development Basics",
      lessons: course.lessons?.slice(4, 10) || []
    },
    {
      id: 'module-3',
      title: "Advanced Techniques",
      lessons: course.lessons?.slice(10) || []
    }
  ];
  
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Header with back button */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <Link href={`/viewer/${courseSlug}`}>
          <Button 
            type="text"
            size="tiny"
            icon={<ArrowLeft className="h-3.5 w-3.5" />}
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
      
      {/* Progress indicator */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-700">Your progress</span>
          <span className="text-xs text-slate-500">25% complete</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '25%' }} />
        </div>
      </div>
      
      {/* Scrollable lesson list */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4">
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-slate-900">{module.title}</h4>
                  <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {moduleIndex === 0 ? `${availableLessons} of ${module.lessons.length}` : `0 of ${module.lessons.length}`}
                  </div>
                </div>
                
                <ul className="space-y-0.5">
                  {module.lessons.map((courseLesson) => {
                    const isCurrentLesson = courseLesson.id === currentLessonId;
                    // For demo, lock lessons in modules other than the first
                    const isLocked = moduleIndex > 0 || !courseLesson.videoId;
                    
                    if (isLocked) {
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
                          href={`/viewer/${courseSlug}/lesson/${courseLesson.id}`}
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
                          
                          {/* @ts-expect-error - mock data for completed lessons */}
                          {courseLesson.completed && (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 ml-2 flex-shrink-0" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
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