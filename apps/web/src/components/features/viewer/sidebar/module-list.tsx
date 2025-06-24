'use client';

import type { Course, Lesson, CourseModule } from '@/lib/shared/types/courses';
import { useMemo } from 'react';
import LessonItem from './lesson-item';

// Defined types with consistent naming
interface UILesson extends Lesson {
  completed?: boolean;
}

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

interface ModuleListProps {
  course: Course;
  currentLessonId: string;
  isCollapsed?: boolean;
  isLocked?: boolean;
  completedLessons?: string[];
}

export default function ModuleList({
  course,
  currentLessonId,
  isCollapsed = false,
  isLocked = false,
  completedLessons = []
}: ModuleListProps) {
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

  // Filter available lessons only once per module
  const getAvailableLessons = (lessons: UILesson[] = []) => {
    return lessons.filter((lesson: UILesson) => !isLocked && (lesson as UILesson).videoId);
  };
  
  // Render module with its lessons
  const renderModule = (module: UIModule, moduleIndex: number, isCollapsedView: boolean) => {
    const availableLessons = getAvailableLessons(module.lessons);
    if (availableLessons.length === 0) return null;
    
    if (isCollapsedView) {
      return (
        <div key={module.id} className="w-full">
          {moduleData.length > 1 && moduleIndex > 0 && (
            <div className="my-2 mx-3">
              <div className="border-t border-slate-200"></div>
            </div>
          )}
          
          <div className={moduleData.length > 1 ? 'mb-1' : 'mb-0'}>
            {availableLessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isCurrentLesson={lesson.id === currentLessonId}
                isLocked={isLocked || !lesson.videoId}
                index={index}
                isCollapsed={true}
              />
            ))}
          </div>
        </div>
      );
    }
    
    const moduleLessons = module.lessons || [];
    const completedModuleLessons = moduleLessons.filter(lesson => lesson.completed)?.length || 0;
    const completionPercentage = moduleLessons.length > 0 
      ? Math.round((completedModuleLessons / moduleLessons.length) * 100) 
      : 0;
    
    return (
      <div key={module.id} className="space-y-1">
        <div className="flex items-center justify-between mb-1">
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
        
        <ul className="space-y-0.5">
          {moduleLessons.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isCurrentLesson={lesson.id === currentLessonId}
              isLocked={isLocked || !lesson.videoId}
              index={index}
              isCollapsed={false}
            />
          ))}
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
