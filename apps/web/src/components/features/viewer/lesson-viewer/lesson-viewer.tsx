'use client';

import type { Lesson } from '@/lib/types/api';
import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import { useVideoStore } from '@/lib/stores/video-player';
import { useViewerStore } from '@/lib/stores/viewer';
import { useRouter } from 'next/navigation';
import { videoEventBus, VideoEventType } from '@/lib/events/video-event-bus';

// Import our components
import { VideoPlayer } from './video-player';
import { VideoChapters } from './video-chapters';
import { LessonSidebar } from './lesson-sidebar';
import AIChatPanel from '../ai-chat/chat-container';

interface LessonViewerProps {
  lesson: Lesson;
  currentIndex: number;
  totalLessons: number;
  nextLesson: Lesson | null;
  courseSlug: string;
}

export function LessonViewer({
  lesson,
  currentIndex,
  totalLessons,
  nextLesson,
  courseSlug
}: LessonViewerProps) {
  // Chat panel visibility state
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Get video-related state and actions from our store
  const { progress, resetVideoState, setVideoId, setLessonId } = useVideoStore();
  
  // Get the viewer store for lesson completion status
  const { 
    lessonProgress, 
    completedLessons,
    setLessonProgress,
    markLessonCompleted
  } = useViewerStore();
  
  // Values derived from stores
  const effectiveProgress = lessonProgress[lesson.id] || progress;
  const effectiveIsCompleted = completedLessons.includes(lesson.id);
  
  // Update video and lesson IDs when they change
  useEffect(() => {
    setVideoId(lesson.videoId || null);
    setLessonId(lesson.id);
    
    // Cleanup
    return () => {
      resetVideoState();
    };
  }, [lesson.id, lesson.videoId, setVideoId, setLessonId, resetVideoState]);
  
  // Connect to video event bus for additional events
  useEffect(() => {
    const unsubscribeFunctions = [
      videoEventBus.subscribe(VideoEventType.SEEK_TO, (data) => {
        if (data.lessonId === lesson.id) {
          // Let the store handle it, no need for duplicate code
        }
      }),
      
      videoEventBus.subscribe(VideoEventType.PLAY, (data) => {
        if (data.lessonId === lesson.id) {
          // Just pass through for now, the player will handle this
        }
      }),
      
      videoEventBus.subscribe(VideoEventType.PAUSE, (data) => {
        if (data.lessonId === lesson.id) {
          // Just pass through for now, the player will handle this
        }
      })
    ];
    
    // Return cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [lesson.id]);
  
  // Handle progress updates
  const handleProgress = useCallback((newProgress: number) => {
    if (newProgress > (lessonProgress[lesson.id] || 0)) {
      setLessonProgress(lesson.id, newProgress);
      
      // Auto mark complete at 95%
      if (newProgress >= 95 && !effectiveIsCompleted) {
        markLessonCompleted(lesson.id);
      }
    }
  }, [lesson.id, lessonProgress, effectiveIsCompleted, setLessonProgress, markLessonCompleted]);
  
  // Update progress when store progress changes
  useEffect(() => {
    if (progress > 0) {
      handleProgress(progress);
    }
  }, [progress, handleProgress]);

  // Toggle chat visibility
  const toggleChat = () => setIsChatVisible(!isChatVisible);
  
  // Handle marking lesson as complete
  const handleMarkComplete = async () => {
    if (isMarkingComplete || effectiveIsCompleted) return;
    
    setIsMarkingComplete(true);
    try {
      markLessonCompleted(lesson.id);
    } finally {
      setIsMarkingComplete(false);
    }
  };
  
  // Calculate course progress percentage
  const courseProgress = Math.round(((currentIndex + 1) / totalLessons) * 100);

  const router = useRouter();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-200">
        <div 
          className="h-1 bg-emerald-600 transition-all duration-300 ease-out" 
          style={{ width: `${courseProgress}%` }} 
        />
      </div>
      
      {/* Main content area with chat panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main lesson content */}
        <div className={`flex-1 overflow-y-auto scrollbar-hide transition-all duration-300 ${isChatVisible ? 'md:w-2/3 lg:w-3/4' : 'w-full'}`}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Lesson navigation */}
            <LessonSidebar 
              currentIndex={currentIndex}
              totalLessons={totalLessons}
              progress={courseProgress}
              nextLesson={nextLesson}
              courseSlug={courseSlug}
            />
            
            {/* Lesson title and completion status */}
            <div className="flex justify-between items-center mb-4">
              {/* Lesson title */}
              <h1 className="text-xl sm:text-2xl font-medium text-slate-900 pr-4">{lesson.title}</h1>
              
              <div className="flex items-center gap-2">
                {/* Completion button */}
                <Button
                  type={effectiveIsCompleted ? "outline" : "primary"}
                  size="small"
                  icon={effectiveIsCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete || effectiveIsCompleted}
                  className={`hidden sm:flex ${effectiveIsCompleted ? "text-emerald-700 border-emerald-200 bg-emerald-50" : ""}`}
                >
                  {effectiveIsCompleted ? "Completed" : "Mark as Complete"}
                </Button>
                
                {/* Desktop chat toggle button */}
                <button 
                  onClick={toggleChat}
                  className="hidden md:flex p-2 text-slate-500 hover:text-emerald-600 transition-colors"
                  aria-label={isChatVisible ? "Hide chat assistant" : "Show chat assistant"}
                  title={isChatVisible ? "Hide chat assistant" : "Show chat assistant"}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                
                {/* Mobile chat toggle button */}
                <button 
                  onClick={toggleChat}
                  className="md:hidden p-2 text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {isChatVisible ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Video player */}
            <div className="mb-6">
              <VideoPlayer 
                videoId={lesson.videoId}
                lessonId={lesson.id}
                startAt={effectiveProgress}
              />
              
              {/* Video chapters */}
              {lesson.videoId && (
                <VideoChapters 
                  lessonId={lesson.id} 
                  videoId={lesson.videoId}
                  courseId={lesson.courseId} 
                />
              )}
            </div>
            
            {/* Lesson description */}
            {lesson.description && (
              <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
                <h2 className="text-sm font-medium text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  About This Lesson
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {lesson.description}
                </div>
              </div>
            )}
            
            {/* Next lesson prompt or course completion */}
            <div className={`border-l-4 ${nextLesson ? 'border-emerald-500' : 'border-blue-500'} bg-white rounded-md ${nextLesson ? 'pl-3 pr-4 py-3' : 'p-4'} mb-6`}>
              {nextLesson ? (
                // Next lesson card
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <h2 className="text-base font-medium text-slate-900">Continue Learning</h2>
                      <p className="text-sm text-slate-600 mt-0.5">Up next: <span className="font-medium">{nextLesson.title}</span></p>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    iconRight={<ChevronRight className="h-3.5 w-3.5" />}
                    className="sm:flex-shrink-0"
                    onClick={() => router.push(`/viewer/${courseSlug}/${nextLesson.id}`)}
                  >
                    Next Lesson
                  </Button>
                </div>
              ) : (
                // Course completion card
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-6 w-6 text-blue-500 mb-3" />
                  <h2 className="text-base font-medium text-slate-900 mb-1">Course Section Completed!</h2>
                  <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto text-center">
                    You&apos;ve finished all lessons in this section. Continue exploring other courses.
                  </p>
                  <Button
                    type="outline"
                    size="small"
                    onClick={() => router.push(`/viewer/${courseSlug}`)}
                  >
                    Back to Course Overview
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Chat panel - hidden on mobile unless toggled, always visible on desktop unless toggled */}
        <div 
          className={`
            ${isChatVisible ? 'flex' : 'hidden'} 
            flex-col w-full md:w-1/3 lg:w-1/4 max-w-md
            fixed md:relative inset-0 z-10 md:z-0
            bg-white
            transition-all duration-300 ease-in-out
          `}
        >
          {/* Chat panel header with close button */}
          <div className="flex flex-col h-full">
            <AIChatPanel 
              lessonId={lesson.id} 
              courseId={lesson.courseId}
              lessonTitle={lesson.title} 
            />
            
            {/* Close button on right edge */}
            <button
              onClick={toggleChat}
              className="absolute hidden md:flex top-1/2 -right-8 transform -translate-y-1/2 p-1.5 bg-white border border-slate-200 rounded-r-md text-slate-400 hover:text-emerald-600"
              aria-label="Hide chat"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Chat toggle button that appears when chat is hidden on desktop */}
        {!isChatVisible && (
          <button
            onClick={toggleChat}
            className="hidden md:flex fixed right-0 top-1/2 transform -translate-y-1/2 p-1.5 bg-white border border-slate-200 rounded-l-md text-slate-400 hover:text-emerald-600"
            aria-label="Show chat"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
} 