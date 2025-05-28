'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Lesson } from '@/lib/stores/courseStore';
import { GripVertical, Trash2, FilmIcon } from 'lucide-react';

// Type for the core drag and drop functionality only
interface DraggableLessonListProps {
  lessons: Lesson[];
  onReorder: (lessons: Lesson[]) => void;
  renderLesson: (lesson: Lesson, index: number, dragHandleProps: any) => React.ReactNode;
  emptyState?: React.ReactNode;
}

// Separate components for different concerns

/**
 * Core drag and drop functionality only - no UI specifics
 */
export function DraggableLessonList({
  lessons,
  onReorder,
  renderLesson,
  emptyState
}: DraggableLessonListProps) {
  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    // If position didn't change
    if (sourceIndex === destIndex) {
      return;
    }
    
    // Reorder the lessons array
    const reorderedItems = Array.from(lessons);
    const [removed] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destIndex, 0, removed);
    
    // Update the order property
    const updatedLessons = reorderedItems.map((lesson, index) => ({
      ...lesson,
      order: index
    }));
    
    // Send the updated array to parent
    onReorder(updatedLessons);
  };
  
  if (lessons.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="lessons">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {lessons.map((lesson, index) => (
              <Draggable 
                key={lesson.id} 
                draggableId={lesson.id} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`border rounded-lg ${
                      snapshot.isDragging 
                        ? 'bg-neutral-50 border-neutral-400 shadow-lg' 
                        : 'border-neutral-200'
                    }`}
                  >
                    {renderLesson(lesson, index, provided.dragHandleProps)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// Types for the lesson editor component
interface LessonEditorProps {
  lesson: Lesson;
  index: number;
  dragHandleProps: any;
  onUpdateLesson: (id: string, field: keyof Lesson, value: string) => void;
  onRemoveLesson: (id: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => void;
  onFileRemove: (lessonId: string) => void;
}

/**
 * Lesson editor form component
 */
export function LessonEditor({
  lesson,
  index,
  dragHandleProps,
  onUpdateLesson,
  onRemoveLesson,
  onFileChange,
  onFileRemove
}: LessonEditorProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Header with drag handle and remove button */}
      <div className="flex items-center justify-between">
        <div 
          {...dragHandleProps} 
          className="flex items-center gap-2 cursor-grab hover:text-emerald-600"
        >
          <GripVertical className="h-5 w-5 text-neutral-400" />
          <div className="h-6 w-6 bg-emerald-100 rounded-full text-emerald-700 flex items-center justify-center">
            <span className="text-xs font-medium">{index + 1}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemoveLesson(lesson.id)}
          className="text-neutral-400 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      {/* Lesson title */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Lesson Title
        </label>
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => onUpdateLesson(lesson.id, 'title', e.target.value)}
          placeholder="e.g. Introduction to TypeScript"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md"
          required
        />
      </div>
      
      {/* Lesson description */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={lesson.description}
          onChange={(e) => onUpdateLesson(lesson.id, 'description', e.target.value)}
          rows={2}
          placeholder="What will students learn in this lesson?"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md"
        />
      </div>
      
      {/* Video upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Lesson Video
        </label>
        
        {!lesson.file ? (
          <VideoUploader 
            lessonId={lesson.id} 
            onFileChange={onFileChange} 
          />
        ) : (
          <VideoPreview 
            lesson={lesson} 
            onFileRemove={onFileRemove} 
          />
        )}
      </div>
    </div>
  );
}

// Smaller, focused components for video handling
interface VideoUploaderProps {
  lessonId: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => void;
}

export function VideoUploader({ lessonId, onFileChange }: VideoUploaderProps) {
  return (
    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
      <input
        type="file"
        id={`video-upload-${lessonId}`}
        className="hidden"
        accept="video/*"
        onChange={(e) => onFileChange(e, lessonId)}
      />
      
      <label 
        htmlFor={`video-upload-${lessonId}`} 
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <FilmIcon className="h-8 w-8 text-neutral-400 mb-2" />
        <p className="text-sm font-medium text-neutral-700">
          Upload video for this lesson
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          MP4, MOV or WebM up to 2GB
        </p>
      </label>
    </div>
  );
}

interface VideoPreviewProps {
  lesson: Lesson;
  onFileRemove: (lessonId: string) => void;
}

export function VideoPreview({ lesson, onFileRemove }: VideoPreviewProps) {
  return (
    <div className="border border-neutral-200 rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium truncate max-w-xs">
            {lesson.fileName}
          </span>
          <span className="text-xs text-neutral-500">
            {lesson.fileSize}
          </span>
        </div>
        
        <button
          type="button"
          onClick={() => onFileRemove(lesson.id)}
          className="text-neutral-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="w-full bg-neutral-100 rounded-full h-1.5">
        <div
          className="bg-emerald-500 h-1.5 rounded-full"
          style={{ width: `${lesson.progress}%` }}
        />
      </div>
      
      <div className="mt-1 flex justify-between text-xs">
        <span className="text-neutral-500">
          {lesson.progress === 100 ? 'Completed' : 'Uploading...'}
        </span>
        <span className="text-neutral-500">{lesson.progress}%</span>
      </div>
    </div>
  );
}

// Empty state component
interface EmptyLessonStateProps {
  onAddLesson?: () => void;
}

export function EmptyLessonState({ onAddLesson }: EmptyLessonStateProps) {
  return (
    <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
      <div className="mb-3 text-neutral-400">
        <FilmIcon className="h-10 w-10 mx-auto" />
      </div>
      <p className="text-sm text-neutral-600 mb-4">
        Your course doesn't have any lessons yet
      </p>
      {onAddLesson && (
        <button
          type="button"
          onClick={onAddLesson}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
        >
          Add Your First Lesson
        </button>
      )}
    </div>
  );
}

// Composite component that puts it all together (for backward compatibility)
interface CourseLessonEditorProps {
  lessons: Lesson[];
  onUpdateLesson: (id: string, field: keyof Lesson, value: string) => void;
  onRemoveLesson: (id: string) => void;
  onReorder: (lessons: Lesson[]) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => void;
  onFileRemove: (lessonId: string) => void;
  addLesson?: () => void;
}

export function CourseLessonEditor(props: CourseLessonEditorProps) {
  const {
    lessons,
    onUpdateLesson,
    onRemoveLesson,
    onReorder,
    onFileChange,
    onFileRemove,
    addLesson
  } = props;
  
  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="p-6">
        <DraggableLessonList
          lessons={lessons}
          onReorder={onReorder}
          emptyState={<EmptyLessonState onAddLesson={addLesson} />}
          renderLesson={(lesson, index, dragHandleProps) => (
            <LessonEditor
              lesson={lesson}
              index={index}
              dragHandleProps={dragHandleProps}
              onUpdateLesson={onUpdateLesson}
              onRemoveLesson={onRemoveLesson}
              onFileChange={onFileChange}
              onFileRemove={onFileRemove}
            />
          )}
        />
      </div>
    </div>
  );
}