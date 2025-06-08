import { useCallback, useState, useEffect } from 'react';
import { VideoEventType, videoEventBus } from '@/lib/events/video-event-bus';

/**
 * Hook to handle jumping to video timestamps
 */
export function useTimestampNavigation(lessonId: string) {
  // Convert timestamp string [MM:SS] to seconds
  const parseTimestamp = useCallback((timeStr: string): number => {
    // Remove the brackets and split by colon
    const cleanTime = timeStr.replace(/[\[\]]/g, '');
    const [minutes, seconds] = cleanTime.split(':').map(num => parseInt(num, 10));
    
    if (isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }
    
    return (minutes * 60) + seconds;
  }, []);
  
  // Handle jump to timestamp using the event bus
  const handleJumpToTimestamp = useCallback((timeStr: string): void => {
    const seconds = parseTimestamp(timeStr);
    
    videoEventBus.dispatch(VideoEventType.SEEK_TO, {
      time: seconds,
      lessonId
    });
  }, [lessonId, parseTimestamp]);
  
  return { handleJumpToTimestamp, parseTimestamp };
}

/**
 * Hook to handle message UI interactions
 */
export function useMessageInteractions() {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, []);
  
  return { isCopied, handleCopy };
}

/**
 * Hook to handle input area resizing
 */
export function useInputResizing(input: string) {
  const [inputRows, setInputRows] = useState(1);
  
  useEffect(() => {
    if (!input) {
      setInputRows(1);
      return;
    }
    
    const lineCount = input.split('\n').length;
    setInputRows(Math.min(5, Math.max(1, lineCount)));
  }, [input]);
  
  return { inputRows };
} 