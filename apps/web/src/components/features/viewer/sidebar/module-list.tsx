'use client';

import type { Course, Lesson, CourseModule } from '@/lib/shared/types/courses';
import { useMemo, memo, useRef, useEffect } from 'react';
import LessonItem from './lesson-item';

// ─────────────────────────────────────────────────────────────────────────────
// Dom helpers & keyboard handlers (outside component to satisfy eslint rules)
// ─────────────────────────────────────────────────────────────────────────────

function $(id: string): HTMLElement | undefined {
  return document.querySelector<HTMLElement>(`#${id}`) ?? undefined;
}

function moduleKeyDownHandler(
  e: React.KeyboardEvent,
  moduleIndex: number,
  isCollapsed: boolean,
) {
  if (isCollapsed) return;

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      const next = $(`module-${moduleIndex}-lesson-0`) ?? $(
        `module-${moduleIndex + 1}`,
      );
      next?.focus();
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      const prev = $(`module-${moduleIndex - 1}`);
      prev?.focus();
      break;
    }
  }
}

function lessonKeyDownHandler(
  e: React.KeyboardEvent,
  moduleIndex: number,
  lessonIndex: number,
  lessonCount: number,
) {
  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      const targetId =
        lessonIndex < lessonCount - 1
          ? `module-${moduleIndex}-lesson-${lessonIndex + 1}`
          : `module-${moduleIndex + 1}`;
      $(targetId)?.focus();
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      const targetId =
        lessonIndex > 0
          ? `module-${moduleIndex}-lesson-${lessonIndex - 1}`
          : `module-${moduleIndex}`;
      $(targetId)?.focus();
      break;
    }
  }
}

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
  const currentLessonRef = useRef<HTMLElement | null>(null);
  const setCurrentLessonRef = (el: HTMLElement | null) => {
    currentLessonRef.current = el;
  };
  
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
    if (enhancedLessons.length > 0) {
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
  
  // (handlers moved to module scope)
  
  // Render module with its lessons - optimized with fewer object creations
  const renderModule = (module: UIModule, moduleIndex: number, isCollapsedView: boolean) => {
    const lessonsToRender = module.lessons;
    if (lessonsToRender.length === 0) return;
    
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
                  ref={isCurrentLesson ? setCurrentLessonRef : undefined}
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
        <button
          type="button"
          className="flex w-full items-center justify-between mb-1 focus:outline-none"
          id={`module-${moduleIndex}`}
          onKeyDown={(e) => moduleKeyDownHandler(e, moduleIndex, isCollapsed)}
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
        </button>
        
        <ul className="space-y-0.5">
          {moduleLessons.map((lesson, index) => {
            const isCurrentLesson = lesson.id === currentLessonId;
            return (
              <li key={lesson.id} className="list-none">
                <button
                  type="button"
                  id={`module-${moduleIndex}-lesson-${index}`}
                  ref={isCurrentLesson ? setCurrentLessonRef : undefined}
                  onKeyDown={(e) => lessonKeyDownHandler(e, moduleIndex, index, moduleLessons.length)}
                  className="w-full text-left focus:outline-none"
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
                </button>
              </li>
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
