import { Lesson } from '@/lib/utils/api-client';
import { Play, Lock, BookOpen } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}

export function LessonList({ lessons, selectedLessonId, onSelectLesson }: LessonListProps) {
  if (!lessons.length) {
    return (
      <div className="p-6 text-center">
        <BookOpen className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500 text-sm">No lessons available</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {lessons.map((lesson, index) => (
        <button 
          key={lesson.id} 
          onClick={() => onSelectLesson(lesson.id)}
          className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors border-l-4 ${
            selectedLessonId === lesson.id 
              ? 'bg-neutral-50 border-l-black' 
              : 'border-l-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              selectedLessonId === lesson.id ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {selectedLessonId === lesson.id ? (
                <Play className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-neutral-900 truncate">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{lesson.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {lesson.videoId ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <Play className="h-3 w-3" />
                    Video
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                    <Lock className="h-3 w-3" />
                    No Video
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}