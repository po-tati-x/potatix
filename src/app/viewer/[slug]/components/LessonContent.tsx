import { Lesson } from '@/lib/utils/api-client';
import { VideoPlayer } from './VideoPlayer';
import { LessonNavigation } from './LessonNavigation';

interface LessonContentProps {
  lesson: Lesson;
  currentIndex: number;
  totalLessons: number;
  videoError: string | null;
  onVideoError: (error: any) => void;
  onResetError: () => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
}

export function LessonContent({
  lesson,
  currentIndex,
  totalLessons,
  videoError,
  onVideoError,
  onResetError,
  onPrevLesson,
  onNextLesson
}: LessonContentProps) {
  return (
    <div className="p-8">
      {/* Lesson header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">{lesson.title}</h1>
          <p className="text-neutral-600">
            Lesson {currentIndex + 1} of {totalLessons}
          </p>
        </div>
        <LessonNavigation 
          currentIndex={currentIndex}
          totalLessons={totalLessons}
          onPrev={onPrevLesson}
          onNext={onNextLesson}
        />
      </div>
      
      {/* Video player */}
      <div className="mb-8">
        <VideoPlayer 
          videoId={lesson.videoId}
          title={lesson.title}
          lessonId={lesson.id}
          error={videoError}
          onError={onVideoError}
          onResetError={onResetError}
        />
      </div>
      
      {/* Lesson description */}
      {lesson.description && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">About This Lesson</h2>
          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
              {lesson.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}