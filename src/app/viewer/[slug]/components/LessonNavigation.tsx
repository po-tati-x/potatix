import { ArrowLeft, ArrowRight } from 'lucide-react';

interface LessonNavigationProps {
  currentIndex: number;
  totalLessons: number;
  onPrev: () => void;
  onNext: () => void;
}

export function LessonNavigation({ 
  currentIndex, 
  totalLessons, 
  onPrev, 
  onNext 
}: LessonNavigationProps) {
  if (totalLessons <= 1 || currentIndex < 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={onPrev}
        disabled={currentIndex <= 0}
        className={`p-2 rounded-lg transition-colors ${
          currentIndex <= 0 
            ? 'text-neutral-300 cursor-not-allowed' 
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
        }`}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      
      <span className="text-sm text-neutral-500 px-3">
        {currentIndex + 1} of {totalLessons}
      </span>
      
      <button 
        onClick={onNext}
        disabled={currentIndex >= totalLessons - 1}
        className={`p-2 rounded-lg transition-colors ${
          currentIndex >= totalLessons - 1
            ? 'text-neutral-300 cursor-not-allowed' 
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
        }`}
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}