'use client';

import type { Course, Lesson, CourseModule } from '@/lib/shared/types/courses';
import { useMemo, memo, useRef, useEffect } from 'react';
import LessonItem from './lesson-item';

// Defined types with consistent naming
interface UILesson extends Lesson {
  completed?: boolean;
}

interface UIModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  lessons: UILesson[];
}

interface ModuleListProps {
  course: Course;
  currentLessonId: string;
  isCollapsed?: boolean;
  /** Global lock flag (e.g., when enrollment inactive) */
  isLocked?: boolean;
  completedLessons?: string[];
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Triggered to prompt auth (e.g., open login modal) */
  onAuthRequired?: () => void;
}

function ModuleList({
  course,
  currentLessonId,
  isCollapsed = false,
  isLocked = false,
  completedLessons = [],
  isAuthenticated = false,
  onAuthRequired,
}: ModuleListProps) {
  // Reference to the current lesson element for auto-scrolling
  const currentLessonRef = useRef<HTMLDivElement>(null);
  
  // Transform lessons only once with completion status
  const enhancedLessons = useMemo(() => {
    if (!course.lessons) return [];
    
    return course.lessons.map((lesson: Lesson) => ({
      ...lesson,
      completed: completedLessons.includes(lesson.id)
    }));
  }, [course.lessons, completedLessons]);
  
  // Generate module data only when dependencies change
  const moduleData = useMemo(() => {
    if (course.modules?.length) {
      return course.modules.map((module: CourseModule) => ({
        ...module,
        lessons: enhancedLessons.filter(lesson => lesson.moduleId === module.id)
      })) as UIModule[];
    }
    
    // Fallback for courses without modules
    if (enhancedLessons.length) {
      return [{
        id: 'default-module', 
        title: 'Course Content', 
        description: '', 
        order: 1,
        courseId: course.id,
        lessons: enhancedLessons,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt || course.createdAt,
      }] as UIModule[];
    }
    
    return [] as UIModule[];
  }, [course, enhancedLessons]);

  // Auto-scroll to current lesson on mount and when currentLessonId changes
  useEffect(() => {
    if (currentLessonRef.current && currentLessonId) {
      // Scroll the current lesson into view with a small delay to ensure DOM is ready
      setTimeout(() => {
        currentLessonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [currentLessonId, isCollapsed]);
  
  // Keyboard navigation handler for module headers
  const handleModuleKeyDown = (e: React.KeyboardEvent, moduleIndex: number) => {
    // Only handle keyboard navigation when not collapsed
    if (isCollapsed) return;
    
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        // Focus first lesson in module or next module header
        const nextElement =
          document.getElementById(`module-${moduleIndex}-lesson-0`) ||
          document.getElementById(`module-${moduleIndex + 1}`);
        nextElement?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        // Focus previous module header
        const prevModule = document.getElementById(`module-${moduleIndex - 1}`);
        if (prevModule) {
          prevModule.focus();
        }
        break;
      }
    }
  };
  
  // Keyboard navigation handler for lesson items
  const handleLessonKeyDown = (e: React.KeyboardEvent, moduleIndex: number, lessonIndex: number, lessonCount: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // Focus next lesson or next module header
        if (lessonIndex < lessonCount - 1) {
          document.getElementById(`module-${moduleIndex}-lesson-${lessonIndex + 1}`)?.focus();
        } else {
          document.getElementById(`module-${moduleIndex + 1}`)?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Focus previous lesson or module header
        if (lessonIndex > 0) {
          document.getElementById(`module-${moduleIndex}-lesson-${lessonIndex - 1}`)?.focus();
        } else {
          document.getElementById(`module-${moduleIndex}`)?.focus();
        }
        break;
    }
  };
  
  // Render module with its lessons - optimized with fewer object creations
  const renderModule = (module: UIModule, moduleIndex: number, isCollapsedView: boolean) => {
    const lessonsToRender = module.lessons;
    if (lessonsToRender.length === 0) return null;
    
    if (isCollapsedView) {
      return (
        <div key={module.id} className="w-full">
          {moduleData.length > 1 && moduleIndex > 0 && (
            <div className="my-2 mx-3">
              <div className="border-t border-slate-200"></div>
            </div>
          )}
          
          <div className={moduleData.length > 1 ? 'mb-1' : 'mb-0'}>
            {lessonsToRender.map((lesson, index) => {
              const isCurrentLesson = lesson.id === currentLessonId;
              return (
                <div 
                  key={lesson.id}
                  ref={isCurrentLesson ? currentLessonRef : null}
                  id={`module-${moduleIndex}-lesson-${index}`}
                >
                  <LessonItem
                    lesson={lesson}
                    isCurrentLesson={isCurrentLesson}
                    isLocked={isLocked && lesson.visibility !== 'public'}
                    index={index}
                    isCollapsed={true}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={onAuthRequired}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    const moduleLessons = lessonsToRender;
    const completedModuleLessons = moduleLessons.filter(lesson => lesson.completed)?.length || 0;
    const completionPercentage = moduleLessons.length > 0 
      ? Math.round((completedModuleLessons / moduleLessons.length) * 100) 
      : 0;
    
    return (
      <div key={module.id} className="space-y-1">
        <div 
          className="flex items-center justify-between mb-1"
          id={`module-${moduleIndex}`}
          tabIndex={0}
          role="heading"
          aria-level={2}
          onKeyDown={(e) => handleModuleKeyDown(e, moduleIndex)}
        >
          <div className="flex items-center gap-1.5">
            <h4 className="font-medium text-sm text-slate-900">{module.title}</h4>
            <span className="text-xs text-slate-500">({moduleLessons.length})</span>
          </div>
          
          {completedModuleLessons > 0 && (
            <div className="flex items-center" title={`${completedModuleLessons} of ${moduleLessons.length} completed`}>
              <span className="text-xs text-slate-500 mr-1.5">&nbsp;{completedModuleLessons}/{moduleLessons.length}</span>
              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <ul className="space-y-0.5" role="list">
          {moduleLessons.map((lesson, index) => {
            const isCurrentLesson = lesson.id === currentLessonId;
            return (
              <div 
                key={lesson.id}
                ref={isCurrentLesson ? currentLessonRef : null}
                id={`module-${moduleIndex}-lesson-${index}`}
                onKeyDown={(e) => handleLessonKeyDown(e, moduleIndex, index, moduleLessons.length)}
              >
                <LessonItem
                  lesson={lesson}
                  isCurrentLesson={isCurrentLesson}
                  isLocked={isLocked && lesson.visibility !== 'public'}
                  index={index}
                  isCollapsed={false}
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={onAuthRequired}
                />
              </div>
            );
          })}
        </ul>
      </div>
    );
  };

  // Return appropriate view based on collapsed state
  if (isCollapsed) {
    return (
      <div className="flex flex-col w-full px-1">
        {moduleData.map((module, idx) => renderModule(module, idx, true))}
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="space-y-4">
        {moduleData.map((module, idx) => renderModule(module, idx, false))}
      </div>
    </div>
  );
}

// Export memoized component
export default memo(ModuleList);
