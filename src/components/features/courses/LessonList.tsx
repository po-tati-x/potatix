'use client';

import { Plus } from 'lucide-react';
import { LessonItem } from './LessonItem';
import { Lesson } from '@/lib/stores/courseStore';

interface LessonListProps {
  lessons: Lesson[];
  onAddLesson: () => void;
  onUpdateLesson: (id: string, field: keyof Lesson, value: string) => void;
  onRemoveLesson: (id: string) => void;
  onMoveLesson: (index: number, direction: 'up' | 'down') => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => void;
  onFileRemove: (lessonId: string) => void;
}

export function LessonList({
  lessons,
  onAddLesson,
  onUpdateLesson,
  onRemoveLesson,
  onMoveLesson,
  onFileChange,
  onFileRemove
}: LessonListProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
        <h3 className="text-md font-medium text-neutral-900">Course Lessons</h3>
        <button 
          type="button"
          onClick={onAddLesson}
          className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Lesson
        </button>
      </div>
      
      <div className="p-6">
        {lessons.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
            <div className="mb-3 text-neutral-400">
              <Plus className="h-10 w-10 mx-auto" />
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Your course doesn't have any lessons yet
            </p>
            <button
              type="button"
              onClick={onAddLesson}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
            >
              Add Your First Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                isFirst={index === 0}
                isLast={index === lessons.length - 1}
                onUpdate={onUpdateLesson}
                onRemove={onRemoveLesson}
                onMove={onMoveLesson}
                onFileChange={onFileChange}
                onFileRemove={onFileRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 