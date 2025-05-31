'use client';

import { ChevronLeft, ChevronRight, AlertTriangle, RefreshCcw, CheckCircle } from 'lucide-react';
import { Lesson } from '@/lib/utils/api-client';
import { VideoPlayer } from './VideoPlayer';
import { Button } from '@/components/ui/potatix/Button';
import { useMemo } from 'react';

interface LessonContentProps {
  lesson: Lesson;
  currentIndex: number;
  totalLessons: number;
  nextLesson: Lesson | null;
  courseSlug: string;
  videoError: string | null;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  onVideoError: () => void;
  onResetError: () => void;
}

export default function LessonContent({
  lesson,
  currentIndex,
  totalLessons,
  nextLesson,
  courseSlug,
  videoError,
  onPrevLesson,
  onNextLesson,
  onVideoError,
  onResetError
}: LessonContentProps) {
  // Calculate progress percentage
  const progress = useMemo(() => {
    return Math.round(((currentIndex + 1) / totalLessons) * 100);
  }, [currentIndex, totalLessons]);
  
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-200">
        <div 
          className="h-1 bg-emerald-600 transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Lesson navigation */}
        <div className="flex justify-between items-center mb-5">
          <Button
            type="text"
            size="small"
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={onPrevLesson}
            disabled={currentIndex === 0}
            className="text-slate-700"
          >
            <span className="hidden sm:inline">Previous lesson</span>
            <span className="sm:hidden">Previous</span>
          </Button>
          
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <span className="font-medium text-emerald-700">{currentIndex + 1} of {totalLessons}</span>
            <span className="text-slate-400">•</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          
          <Button
            type="text"
            size="small"
            iconRight={<ChevronRight className="h-4 w-4" />}
            onClick={onNextLesson}
            disabled={!nextLesson}
            className="text-slate-700"
          >
            <span className="hidden sm:inline">Next lesson</span>
            <span className="sm:hidden">Next</span>
          </Button>
        </div>
        
        {/* Lesson title */}
        <h1 className="text-xl sm:text-2xl font-medium text-slate-900 mb-4">{lesson.title}</h1>
        
        {/* Video player */}
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden mb-6 shadow-sm">
          {videoError ? (
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-2">Video playback error</h3>
              <p className="text-sm text-slate-600 mb-4 max-w-md">{videoError}</p>
              <Button
                type="outline"
                size="small"
                icon={<RefreshCcw className="h-4 w-4" />}
                onClick={onResetError}
              >
                Try again
              </Button>
            </div>
          ) : (
            <VideoPlayer 
              videoId={lesson.videoId}
              lessonId={lesson.id}
              error={videoError}
              onError={onVideoError}
              onResetError={onResetError}
            />
          )}
        </div>
        
        {/* Lesson description */}
        {lesson.description && (
          <div className="bg-white rounded-md border border-slate-200 p-4 mb-6 shadow-sm">
            <h2 className="text-base font-medium text-slate-900 mb-3">About This Lesson</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {lesson.description}
              </p>
            </div>
          </div>
        )}
        
        {/* Next lesson prompt */}
        {nextLesson && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-md border border-emerald-200 p-4 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-slate-900 mb-1">Continue Learning</h2>
                  <p className="text-sm text-slate-700">Up next: <span className="font-medium">{nextLesson.title}</span></p>
                </div>
              </div>
              <Button
                type="primary"
                size="small"
                iconRight={<ChevronRight className="h-4 w-4" />}
                onClick={onNextLesson}
                className="sm:flex-shrink-0"
              >
                Next Lesson
              </Button>
            </div>
            
          </div>
        )}
        
        {/* Completed state when no next lesson */}
        {!nextLesson && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200 p-4 shadow-sm text-center mb-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-base font-medium text-slate-900 mb-2">Course Section Completed!</h2>
              <p className="text-sm text-slate-700 mb-4 max-w-md mx-auto">
                You&apos;ve finished all lessons in this section. Continue exploring other courses.
              </p>
              <Button
                type="outline"
                size="small"
                onClick={() => window.location.href = `/viewer/${courseSlug}`}
              >
                Back to Course Overview
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}