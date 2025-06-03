"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit, Check, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { useUIStore, UILesson } from '@/lib/stores/courses';
import { useUpdateModule, useDeleteModule, useCreateLesson } from '@/lib/api';
import { LessonEditor } from '@/components/features/courses/lessons/lesson-editor';
import { DraggableLessonList } from '@/components/features/courses/lessons/draggable-lesson-list';
import { useQueryClient } from '@tanstack/react-query';
import type { Module, CreateLessonData } from '@/lib/types/api';
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface CourseModuleEditorProps {
  courseId: string;
  module: Module;
  index: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export function CourseModuleEditor({ courseId, module, index, dragHandleProps }: CourseModuleEditorProps) {
  const moduleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { 
    expandedModules, 
    toggleModuleExpanded, 
    editingModuleId, 
    setEditingModule,
    moduleEditFields,
    setModuleEditField,
    toggleLessonExpanded,
    expandedLessons
  } = useUIStore();

  const { mutate: updateModule } = useUpdateModule();
  const { mutate: deleteModule } = useDeleteModule();
  const { mutate: createLesson } = useCreateLesson();

  // State to keep track of locally reordered lessons
  const [localLessons, setLocalLessons] = useState<UILesson[] | null>(null);

  const isEditing = editingModuleId === module.id;
  const isExpanded = expandedModules[module.id] ?? false;
  const currentEditField = moduleEditFields[module.id] || module.title || '';
  
  // Transform standard lessons to UI lessons with either local state (after drag) or API data
  const baseLessons = module.lessons?.map(lesson => ({
    ...lesson,
    expanded: !!expandedLessons[lesson.id],
    uploading: false,
    fileUrl: lesson.videoId ? `https://image.mux.com/${lesson.videoId}/thumbnail.jpg` : undefined
  })) || [];

  // Use locally reordered lessons if available, otherwise use the API data
  const uiLessons = localLessons || baseLessons;
  
  // Reset local lessons when module changes
  useEffect(() => {
    setLocalLessons(null);
  }, [module.id, module.lessons]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setEditingModule(module.id);
    setModuleEditField(module.id, module.title || '');
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  
  const handleEditCancel = () => {
    setEditingModule(null);
  };

  const handleEditSubmit = () => {
    if (currentEditField.trim().length > 0) {
      updateModule({
        courseId,
        moduleId: module.id,
        data: { 
          title: currentEditField 
        }
      });
      setEditingModule(null);
    }
  };

  const handleDeleteModule = () => {
    if (window.confirm('Are you sure you want to delete this module and all its lessons?')) {
      deleteModule({ courseId, moduleId: module.id });
    }
  };

  const handleAddLesson = () => {
    const lessonData: CreateLessonData = {
      title: "New Lesson",
      description: "",
      moduleId: module.id,
      order: uiLessons.length || 0,
    };

    createLesson({ 
      courseId,
      data: lessonData
    }, {
      onSuccess: () => {
        // Reset local lessons to ensure we get fresh data
        setLocalLessons(null);
      }
    });
  };

  // Handle file changes for lessons
  const handleLessonFileChange = (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('File selected for lesson', lessonId, file.name);
  };

  // Handle file removal for lessons
  const handleLessonFileRemove = (lessonId: string) => {
    console.log('Remove video from lesson', lessonId);
  };

  // Handle direct upload complete callback
  const handleDirectUploadComplete = (lessonId: string) => {
    console.log('Direct upload completed for lesson', lessonId);
  };

  // Handle toggling a lesson expanded/collapsed
  const handleToggleLesson = (lessonId: string) => {
    toggleLessonExpanded(lessonId);
  };

  // Handle lesson reordering with immediate UI update
  const handleLessonsReordered = (reorderedLessons: UILesson[]) => {
    // Update local state immediately to reflect the new order
    setLocalLessons(reorderedLessons);
    
    // Invalidate queries to ensure data is refreshed on next fetch
    queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
  };

  // Render an individual lesson with drag handle
  const renderLesson = (lesson: UILesson, idx: number, dragHandleProps: DraggableProvidedDragHandleProps | null, onToggleExpanded?: (id: string) => void) => {
    return (
      <LessonEditor
        key={lesson.id}
        courseId={courseId}
        lesson={lesson}
        index={idx}
        dragHandleProps={dragHandleProps}
        onFileChange={handleLessonFileChange}
        onFileRemove={() => handleLessonFileRemove(lesson.id)}
        onToggleExpanded={onToggleExpanded || handleToggleLesson}
        onDirectUploadComplete={handleDirectUploadComplete}
      />
    );
  };

  // Empty state for when there are no lessons
  const emptyState = (
    <div className="py-8 text-center text-sm text-slate-500 bg-white rounded-md border border-dashed border-slate-200">
      No lessons in this module. Click the &quot;+&quot; button to add one.
    </div>
  );

  return (
    <div
      ref={moduleRef}
      className="border border-slate-200 rounded-lg overflow-hidden bg-white mb-5 transition-all hover:border-slate-300"
    >
      <div 
        className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3 flex-grow">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab hover:cursor-grabbing group"
            >
              <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          )}
          
          <div 
            className="p-1.5 rounded-md transition-colors hover:bg-slate-200 active:bg-slate-300"
            onClick={() => toggleModuleExpanded(module.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            )}
          </div>
          
          {isEditing ? (
            <div className="flex items-center flex-grow">
              <input
                ref={inputRef}
                type="text"
                className="flex h-8 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                value={currentEditField}
                onChange={(e) => setModuleEditField(module.id, e.target.value)}
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
                  onClick={handleEditSubmit}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-emerald-100 text-emerald-600 transition-colors mr-1"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-slate-900">
                {module.title || `Module ${index + 1}`}
              </h3>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
              title="Edit module"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          
          <button
            onClick={handleAddLesson}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-emerald-100 text-emerald-600 transition-colors"
            title="Add lesson"
          >
            <Plus className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleDeleteModule}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-100 text-red-500 transition-colors"
            title="Delete module"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          
          <span className="text-xs font-medium text-slate-500 ml-2 bg-slate-100 py-1 px-2 rounded-full">
            {uiLessons.length || 0} lessons
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="divide-y divide-slate-100 p-3 bg-slate-50">
          <DraggableLessonList
            courseId={courseId}
            lessons={uiLessons}
            emptyState={emptyState}
            renderLesson={renderLesson}
            onToggleExpanded={handleToggleLesson}
            onReorder={handleLessonsReordered}
          />
        </div>
      )}
    </div>
  );
} 