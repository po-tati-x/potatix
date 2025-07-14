'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Play, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import { useVideoStore } from './video-context';
import { VideoEventType, videoEventBus } from '@/lib/shared/utils/video-event-bus';

interface Chapter { id: string; title: string; timestamp: number }

interface VideoChaptersProps {
  lessonId: string;
  playbackId: string;
  courseId?: string; // reserved
}

export function VideoChapters({ lessonId, playbackId }: VideoChaptersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Get video store state and actions
  const { 
    currentTime, 
    chapters, 
    activeChapterId, 
    setChapters,
    setActiveChapterId,
    seekTo
  } = useVideoStore();
  
  // Local fetch state for chapters
  const [chaptersData, setChaptersData] = useState<{ chapters: Chapter[] } | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const fetchChapters = useCallback(async (): Promise<void> => {
    if (!playbackId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/ai/transcript?playbackId=${playbackId}&lessonId=${lessonId}`);
      const json: unknown = await res.json();
      if (res.ok && json && typeof json === 'object' && 'chapters' in json) {
        setChaptersData(json as { chapters: Chapter[] });
      } else if (json && typeof json === 'object' && 'error' in json) {
        const { error: err } = json as { error?: string };
        setError(err ?? 'Failed to load chapters');
      } else {
        setError('Failed to load chapters');
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  }, [playbackId, lessonId]);

  // Fetch on mount / change
  useEffect(() => {
    void fetchChapters();
  }, [fetchChapters]);

  const refetchChapters = fetchChapters;
  
  // Update chapters in store when data is available
  useEffect(() => {
    // Check if we have chapters from either source
    const chaptersToUse = chaptersData?.chapters;
    
    // Only update if we have chapters and they're different from what's in the store
    if (chaptersToUse?.length && JSON.stringify(chaptersToUse) !== JSON.stringify(chapters)) {
      setChapters(chaptersToUse);
    }
  }, [chaptersData, chapters, setChapters]);
  
  // Manual update for active chapter based on current time
  useEffect(() => {
    if (chapters.length === 0 || currentTime === 0) return;
    
    // Find the current chapter based on timestamp
    for (let i = chapters.length - 1; i >= 0; i--) {
      const chapter = chapters[i];
      if (!chapter) continue;
      if (currentTime >= chapter.timestamp) {
        if (activeChapterId !== chapter.id) {
          setActiveChapterId(chapter.id);
        }
        break;
      }
    }
  }, [currentTime, chapters, activeChapterId, setActiveChapterId]);
  
  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Handle jump to timestamp
  const handleJumpTo = useCallback((timestamp: number, chapterId: string): void => {
    seekTo(timestamp);
    
    // Set active chapter ID directly for immediate UI update
    setActiveChapterId(chapterId);
    
    // Also dispatch through the event bus for backward compatibility
    videoEventBus.dispatch(VideoEventType.SEEK_TO, {
      time: timestamp,
      lessonId
    });
  }, [seekTo, lessonId, setActiveChapterId]);
  
  // Empty state with loading, error, or no chapters
  if (isLoading) {
    return (
      <div className="mt-6 border border-slate-200 bg-white rounded-lg p-4 text-center">
        <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-slate-500">Generating video chapters...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mt-6 border border-slate-200 bg-white rounded-lg p-4">
        <div className="flex flex-col items-center">
          <p className="text-sm text-slate-500 mb-3">Could not load video chapters.</p>
          <button
            onClick={() => { void refetchChapters(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm hover:bg-slate-200"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }
  
  if (chapters.length === 0) {
    return (
      <div className="mt-6 border border-slate-200 bg-white rounded-lg p-4 text-center">
        <p className="text-sm text-slate-500">No chapters available for this video.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6 border border-slate-200 overflow-hidden bg-white rounded-lg">
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        className="flex justify-between items-center px-4 py-3 border-b border-slate-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-emerald-600" />
          <span className="font-medium text-slate-800">Chapters</span>
          <span className="text-xs text-slate-500">({chapters.length})</span>
        </div>
        <button className="text-slate-400 hover:text-slate-700 focus:outline-none">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {/* Chapters list */}
      {isExpanded && (
        <ul className="divide-y divide-slate-100">
          {chapters.map((chapter, index) => {
            const isActive = activeChapterId === chapter.id;
            
            return (
              <li 
                key={chapter.id} 
                className={cn(
                  "transition-colors relative",
                  isActive ? "bg-emerald-50" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-start p-3">
                  {/* Chapter number */}
                  <div className={cn(
                    "flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-3",
                    isActive 
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  )}>
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  
                  {/* Chapter content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn(
                        "font-medium text-sm truncate pr-2",
                        isActive ? "text-emerald-900" : "text-slate-800"
                      )}>
                        {chapter.title}
                      </h4>
                      
                      {/* Timestamp button */}
                      <button 
                        onClick={() => handleJumpTo(chapter.timestamp, chapter.id)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium flex-shrink-0",
                          isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        <Play size={10} strokeWidth={3} /> 
                        {formatTime(chapter.timestamp)}
                      </button>
                    </div>
                    
                    <p className={cn(
                      "text-xs line-clamp-2",
                      isActive ? "text-emerald-700/90" : "text-slate-500"
                    )}>
                      {chapter.description}
                    </p>
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="w-1 bg-emerald-500 absolute left-0 top-0 h-full" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 