'use client';

import type { Lesson } from '@/lib/shared/types/courses';
import { Lock, Play, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

interface LessonItemProps {
  lesson: Lesson & { completed?: boolean };
  isCurrentLesson: boolean;
  isLocked: boolean;
  index: number;
  isCollapsed?: boolean;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Callback to prompt auth (e.g., show login modal) */
  onAuthRequired?: () => void;
}

function LessonItem({
  lesson,
  isCurrentLesson,
  isLocked,
  index,
  isCollapsed = false,
  isAuthenticated = false,
  onAuthRequired,
}: LessonItemProps) {
  // If lesson is locked, render locked state
  if (isLocked) {
    return isCollapsed 
      ? renderCollapsedLockedItem()
      : renderExpandedLockedItem();
  }

  // Return appropriate view based on collapsed state  
  return isCollapsed 
    ? renderCollapsedItem() 
    : renderExpandedItem();

  // Collapsed view implementations
  function renderCollapsedItem() {
    // Get background color based on status
    const bgColorClass = isCurrentLesson 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
      : lesson.completed 
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200';

    // Get icon based on status
    const icon = isCurrentLesson 
      ? <Play className="h-3.5 w-3.5" aria-hidden="true" />
      : lesson.completed 
        ? <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> 
        : <span className="text-xs font-medium">{index + 1}</span>;

    // Get status text for screen readers
    const status = isCurrentLesson 
      ? 'Current lesson' 
      : lesson.completed 
        ? 'Completed' 
        : 'Not started';

    return (
      <div className="py-1 px-2 w-full">
        <Link 
          href={`/lesson/${lesson.id}`}
          className="relative block group w-full"
          aria-label={`${lesson.title} (${status})`}
          aria-current={isCurrentLesson ? 'page' : undefined}
          onClick={(e) => {
            if (!isAuthenticated && onAuthRequired) {
              e.preventDefault();
              onAuthRequired();
            }
          }}
        >
          <div 
            className={`w-full flex items-center justify-center py-2 rounded-md border ${bgColorClass} 
              ${isCurrentLesson ? 'shadow-sm' : ''}`}
          >
            {icon}
          </div>
          
          {/* Enhanced tooltip with more details */}
          <div 
            className="absolute left-full top-0 ml-2 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 min-w-40 max-w-60"
            role="tooltip"
          >
            <div className="font-medium mb-0.5 line-clamp-1">{lesson.title}</div>
            <div className="flex items-center text-[10px] text-slate-300">
              <span className={`w-2 h-2 rounded-full mr-1.5 ${
                isCurrentLesson ? 'bg-emerald-400' : 
                lesson.completed ? 'bg-emerald-500' : 
                'bg-slate-400'
              }`}></span>
              {status}
            </div>
          </div>
        </Link>
      </div>
    );
  }
  
  function renderCollapsedLockedItem() {
    return (
      <div className="py-1 px-2 w-full">
        <div 
          className="relative block group w-full cursor-not-allowed"
          aria-label={`${lesson.title} (Locked)`}
        >
          <div className="w-full flex items-center justify-center py-2 rounded-md border bg-slate-100 text-slate-400">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          
          <div 
            className="absolute left-full top-0 ml-2 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 min-w-40 max-w-60"
            role="tooltip"
          >
            <div className="font-medium mb-0.5 line-clamp-1">{lesson.title}</div>
            <div className="flex items-center text-[10px] text-slate-300">
              <span className="w-2 h-2 rounded-full mr-1.5 bg-slate-400"></span>
              Locked
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded view implementations
  function renderExpandedLockedItem() {
    return (
      <li className="relative">
        <div 
          className="flex items-center py-2 px-3 text-sm text-slate-400 hover:bg-slate-50 rounded-md cursor-not-allowed"
          aria-label={`${lesson.title} (Locked)`}
        >
          <Lock className="h-3.5 w-3.5 mr-2 flex-shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{lesson.title}</span>
        </div>
      </li>
    );
  }
  
  function renderExpandedItem() {
    const linkClass = isCurrentLesson 
      ? 'bg-emerald-50 text-emerald-600 font-medium border-l-2 border-emerald-500 pl-2.5' 
      : 'text-slate-700 hover:bg-slate-50';
      
    const iconWrapperClass = isCurrentLesson || lesson.completed
      ? 'bg-emerald-100'
      : 'bg-slate-100';
      
    const iconClass = isCurrentLesson || lesson.completed
      ? 'text-emerald-600'
      : 'text-slate-500';
      
    const icon = isCurrentLesson || lesson.completed
      ? lesson.completed 
        ? <CheckCircle className={`h-3 w-3 ${iconClass}`} aria-hidden="true" /> 
        : <Play className={`h-3 w-3 ${iconClass}`} aria-hidden="true" />
      : <Play className={`h-3 w-3 ${iconClass}`} aria-hidden="true" />;
      
    // Status for screen readers
    const status = isCurrentLesson 
      ? 'Current lesson' 
      : lesson.completed 
        ? 'Completed' 
        : 'Not started';
      
    return (
      <li className="relative transition-transform hover:translate-x-0.5 duration-150">
        <Link 
          href={`/lesson/${lesson.id}`}
          className={`flex items-center py-2 px-3 text-sm rounded-md ${linkClass}`}
          aria-label={`${lesson.title} (${status})`}
          aria-current={isCurrentLesson ? 'page' : undefined}
          onClick={(e) => {
            if (!isAuthenticated && onAuthRequired) {
              e.preventDefault();
              onAuthRequired();
            }
          }}
        >
          <div className={`w-5 h-5 rounded-full ${iconWrapperClass} flex items-center justify-center flex-shrink-0 mr-2`}>
            {icon}
          </div>
          
          <span className="line-clamp-1 flex-1">{lesson.title}</span>
        </Link>
      </li>
    );
  }
}

// Memoize for better performance
export default memo(LessonItem);
