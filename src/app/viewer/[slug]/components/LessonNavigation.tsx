import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';

interface LessonNavigationProps {
  currentIndex: number;
  totalLessons: number;
  onPrev: () => void;
  onNext: () => void;
  isCompact?: boolean;
}

export function LessonNavigation({ 
  currentIndex, 
  totalLessons, 
  onPrev, 
  onNext,
  isCompact = false
}: LessonNavigationProps) {
  const isPrevDisabled = currentIndex <= 0;
  const isNextDisabled = currentIndex >= totalLessons - 1;

  if (totalLessons <= 1 || currentIndex < 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="text"
        size={isCompact ? "tiny" : "small"}
        icon={<ChevronLeft className="h-4 w-4" />}
        onClick={onPrev}
        disabled={isPrevDisabled}
        className="text-slate-700"
      >
        {!isCompact && <span>Previous</span>}
      </Button>
      
      <div className="text-sm text-slate-600 flex items-center gap-2">
        <span className="font-medium">{currentIndex + 1}</span>
        <span className="text-slate-400">/</span>
        <span>{totalLessons}</span>
      </div>
      
      <Button
        type="text"
        size={isCompact ? "tiny" : "small"}
        iconRight={<ChevronRight className="h-4 w-4" />}
        onClick={onNext}
        disabled={isNextDisabled}
        className="text-slate-700"
      >
        {!isCompact && <span>Next</span>}
      </Button>
    </div>
  );
}