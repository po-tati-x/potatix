"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit, Check, X, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useUpdateModule, useDeleteModule, useCreateLesson, useUpdateLesson } from "@/lib/client/hooks/use-courses";
import { courseKeys } from "@/lib/shared/constants/query-keys";
import { LessonEditor } from '@/components/features/courses/lessons/lesson-editor';
import { DraggableLessonList } from '@/components/features/courses/lessons/draggable-lesson-list';
import type { UILesson } from '@/components/features/courses/lessons/draggable-lesson-list';
import { useQueryClient } from '@tanstack/react-query';
import type { Module } from '@/lib/shared/types/courses';
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface CourseModuleEditorProps {
  courseId: string;
  module: Module;
  index: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | undefined;
  onToggleModule?: (moduleId: string) => void;
  isExpanded: boolean;
  expandedLessons: Record<string, boolean>;
  onToggleLesson: (lessonId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function CourseModuleEditor({ 
  courseId, 
  module, 
  index, 
  dragHandleProps,
  onToggleModule,
  isExpanded,
  expandedLessons,
  onToggleLesson,
  onMoveUp,
  onMoveDown
}: CourseModuleEditorProps) {
  const moduleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  /* ------------------------------------------------------------------ */
  /*  Local state                                                       */
  /* ------------------------------------------------------------------ */

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title || '');
  
  // Map of moduleId -> locally reordered lessons
  const [lessonOverrides, setLessonOverrides] = useState<Record<string, UILesson[] | undefined>>({});

  const localLessons = lessonOverrides[module.id];

  const { mutate: updateModule } = useUpdateModule();
  const { mutate: deleteModule } = useDeleteModule();
  const { mutate: createLesson, isPending: isAddingLesson } = useCreateLesson();
  const { mutate: updateLessonMutation } = useUpdateLesson();
  
  // Transform API lessons to UI-friendly structure
  const baseLessons = module.lessons?.map((lesson) => {
    const status = lesson.uploadStatus?.toUpperCase();
    const isUploading = status === "PENDING" || status === "PROCESSING" || status === "UPLOADING";

    return {
      ...lesson,
      expanded: !!expandedLessons[lesson.id],
      uploading: isUploading,
      fileUrl: lesson.playbackId
        ? `https://image.mux.com/${lesson.playbackId}/thumbnail.jpg`
        : undefined,
    };
  }) || [];

  // Merge local overrides with latest data so remote truth wins on upload status
  const uiLessons = localLessons
    ? baseLessons.map((base) => {
        const local = localLessons.find((l) => l.id === base.id);
        return local ? { ...local, ...base } : base;
      })
    : baseLessons;
  
  // No effect needed – when module.id changes, lessonOverrides key changes naturally
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggleModule = () => onToggleModule?.(module.id);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditTitle(module.title || '');

    // focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  
  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSubmit = () => {
    if (editTitle.trim().length > 0) {
      updateModule({
        moduleId: module.id,
        title: editTitle,
        courseId
      });
      setIsEditing(false);
    }
  };

  const handleDeleteModule = () => {
    if (globalThis.confirm('Are you sure you want to delete this module and all its lessons?')) {
      deleteModule({ moduleId: module.id, courseId });
    }
  };

  const handleAddLesson = () => {
    createLesson({ 
      moduleId: module.id,
      title: "New Lesson",
      courseId
    }, {
      onSuccess: () => {
        // Clear overrides for this module so fresh data loads
        setLessonOverrides((prev) => {
          const newOverrides = { ...prev };
          delete newOverrides[module.id];
          return newOverrides;
        });
      }
    });
  };

  // Handle file changes for lessons
  const handleLessonFileChange = (
    input: React.ChangeEvent<HTMLInputElement> | File,
    lessonId: string,
  ) => {
    void input;
    void lessonId;
  };

  // Handle file removal for lessons
  const handleLessonFileRemove = (lessonId: string) => {
    if (!globalThis.confirm('Remove video from this lesson?')) return;

    // Optimistically reset local UI state
    setLessonOverrides((prev) => {
      const currentLessons = prev[module.id] ?? baseLessons;
      const updated = currentLessons.map((lsn) =>
        lsn.id === lessonId
          ? { ...lsn, uploading: false, file: undefined, fileUrl: undefined, playbackId: undefined }
          : lsn,
      );
      return { ...prev, [module.id]: updated };
    });

    updateLessonMutation({
      lessonId,
      playbackId: undefined,
      uploadStatus: undefined,
      courseId,
    });
  };

  // Handle direct upload complete callback
  const handleDirectUploadComplete = (lessonId: string) => {
    // Mark lesson as processing until webhook updates with playbackId
    setLessonOverrides((prev) => {
      const source = prev[module.id] ?? baseLessons;
      const updated = source.map((lsn) =>
        lsn.id === lessonId ? { ...lsn, uploading: true, file: undefined } : lsn,
      );
      return { ...prev, [module.id]: updated };
    });

    // Persist to backend so refresh shows PROCESSING instead of UPLOADING
    updateLessonMutation({
      lessonId,
      uploadStatus: 'processing',
      courseId,
    });

    // Trigger refetch to eventually get playbackId
    void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  };

  const handleProcessingComplete = () => {
    // video ready, refresh data so UX shows preview
    void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  };

  // Handle lesson reordering with immediate UI update
  const handleLessonsReordered = (reorderedLessons: UILesson[]) => {
    // Update local state immediately to reflect the new order
    setLessonOverrides((prev) => ({ ...prev, [module.id]: reorderedLessons }));
    
    // Invalidate queries to ensure data is refreshed on next fetch
    void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
  };

  // Render an individual lesson with drag handle
  const renderLesson = (lesson: UILesson, idx: number, dragHandleProps: DraggableProvidedDragHandleProps | null, onToggleExpanded?: (id: string) => void) => {
    return (
      <LessonEditor
        key={lesson.id}
        courseId={courseId}
        lesson={lesson}
        index={idx}
        dragHandleProps={dragHandleProps ?? undefined}
        onFileChange={handleLessonFileChange}
        onFileRemove={() => handleLessonFileRemove(lesson.id)}
        onToggleExpanded={onToggleExpanded || onToggleLesson}
        onDirectUploadComplete={handleDirectUploadComplete}
        onProcessingComplete={handleProcessingComplete}
      />
    );
  };

  // Empty state for when there are no lessons
  const emptyState = (
    <div className="py-8 text-center text-sm text-slate-500 bg-white rounded-md border border-dashed border-slate-300">
      No lessons yet. Click &quot;Add Lesson&quot; to get started.
    </div>
  );

  // Add Lesson card component
  function AddLessonCard() {
    return (
      <button
        type="button"
        onClick={handleAddLesson}
        disabled={isAddingLesson}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 border border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors ${
          isAddingLesson ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="h-6 w-6 flex items-center justify-center rounded-full bg-emerald-600 text-white">
            {isAddingLesson ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </span>
          <span className="text-sm font-medium text-slate-900">Add Lesson</span>
        </div>
        <span className="text-xs text-slate-500">Create a new lesson</span>
      </button>
    );
  }

  return (
    <div
      ref={moduleRef}
      className="border border-slate-200 rounded-lg overflow-hidden bg-white mb-5 transition-all hover:border-slate-300"
    >
      <div
        className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab hover:cursor-grabbing group"
            >
              <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          )}
          
          <button
            type="button"
            onClick={handleToggleModule}
            className="p-1.5 rounded-md hover:bg-slate-200 active:bg-slate-300"
            aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            )}
          </button>
          
          {isEditing ? (
            <div className="flex items-center flex-grow">
              <input
                ref={inputRef}
                type="text"
                className="flex h-8 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditSubmit();
                  } else if (e.key === 'Escape') {
                    handleEditCancel();
                  }
                }}
              />
              <div className="flex ml-2">
                <button
                  onClick={(e)=>{e.stopPropagation();handleEditSubmit();}}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-emerald-100 text-emerald-600 transition-colors mr-1"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={(e)=>{e.stopPropagation();handleEditCancel();}}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-slate-900 truncate">
                {module.title || `Module ${index + 1}`}
              </h3>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onMoveUp && (
            <button type="button" onClick={(e)=>{e.stopPropagation();onMoveUp();}} className="p-1.5 rounded-md hover:bg-slate-200">
              <ArrowUp className="h-4 w-4 text-slate-500" />
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={(e)=>{e.stopPropagation();onMoveDown();}} className="p-1.5 rounded-md hover:bg-slate-200">
              <ArrowDown className="h-4 w-4 text-slate-500" />
            </button>
          )}
          {!isEditing && (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Edit module title"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          
          <button
            type="button"
            onClick={handleDeleteModule}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-100 text-red-500 transition-colors"
            aria-label="Delete module"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          
          <span className="text-xs font-medium text-slate-500 ml-2 bg-slate-100 py-1 px-2 rounded-full">
            {uiLessons.length} lessons
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 p-3 bg-slate-50">
          <DraggableLessonList
            courseId={courseId}
            moduleId={module.id}
            lessons={uiLessons}
            emptyState={emptyState}
            renderLesson={renderLesson}
            onToggleExpanded={onToggleLesson}
            onReorder={handleLessonsReordered}
          />

          {/* Add lesson card */}
          <AddLessonCard />
        </div>
      )}
    </div>
  );
} 