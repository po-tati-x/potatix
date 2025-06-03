import { Lesson } from '@/lib/types/api';
import { Play, Lock, FileText } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}

export function LessonList({ lessons, selectedLessonId, onSelectLesson }: LessonListProps) {
  if (!lessons.length) {
    return (
      <div className="p-6 text-center">
        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No lessons available</p>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
      {lessons.map((lesson, index) => {
        const isSelected = selectedLessonId === lesson.id;
        const hasVideo = !!lesson.videoId;
        
        return (
          <button 
            key={lesson.id} 
            onClick={() => onSelectLesson(lesson.id)}
            className={`w-full px-4 py-3 text-left transition-colors border-l-2 flex items-start gap-3 ${
              isSelected 
                ? 'bg-emerald-50 border-l-emerald-600'
                : 'border-l-transparent hover:bg-slate-50'
            }`}
          >
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
              isSelected 
                ? 'bg-emerald-600 text-white' 
                : hasVideo 
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-100 text-slate-400'
            }`}>
              {isSelected ? (
                <Play className="h-3 w-3" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium line-clamp-2 ${
                isSelected ? 'text-slate-900' : 'text-slate-700'
              }`}>
                {lesson.title}
              </h3>
              
              <div className="flex items-center gap-2 mt-1.5">
                {hasVideo ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                    <Play className="h-3 w-3" />
                    Video
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                    <Lock className="h-3 w-3" />
                    No Video
                  </span>
                )}
                
                {lesson.description && (
                  <span className="text-xs text-slate-500 line-clamp-1 flex-1">
                    {lesson.description.length > 30 
                      ? `${lesson.description.substring(0, 30)}...` 
                      : lesson.description}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}