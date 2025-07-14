import { useCallback, useState, useMemo } from 'react';
import { VideoEventType, videoEventBus } from '@/lib/shared/utils/video-event-bus';

/**
 * Hook to handle jumping to video timestamps
 */
export function useTimestampNavigation(lessonId: string) {
  // Convert timestamp string [MM:SS] to seconds
  const parseTimestamp = useCallback((timeStr: string): number => {
    const cleanTime = timeStr.replaceAll('[', '').replaceAll(']', '');
    const [minStr = '0', secStr = '0'] = cleanTime.split(':');

    const minutes = Number.parseInt(minStr, 10);
    const seconds = Number.parseInt(secStr, 10);

    if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return 0;
    }

    return minutes * 60 + seconds;
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
  const inputRows = useMemo(() => {
    if (!input) return 1;

    const lineCount = input.split('\n').length;
    return Math.min(5, Math.max(1, lineCount));
  }, [input]);

  return { inputRows };
} 