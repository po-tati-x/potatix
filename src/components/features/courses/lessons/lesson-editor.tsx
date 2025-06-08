"use client";

import { useState } from "react";
import { Lesson } from "@/lib/types/api";
import { UILesson } from "@/lib/stores/courses";
import { GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { FormField } from "../../../ui/potatix/form-field";
import { VideoUploader } from "../media/video-uploader";
import { VideoPreview } from "../media/video-preview";
import { useUpdateLesson, useDeleteLesson } from "@/lib/api/courses";

// Types for the lesson editor component
interface LessonEditorProps {
  courseId: string;
  lesson: UILesson;
  index: number;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
  onFileRemove: (lessonId: string) => void;
  onToggleExpanded?: (id: string) => void;
  onDirectUploadComplete?: (lessonId: string) => void;
}

/**
 * Lesson editor form component
 */
export function LessonEditor({
  courseId,
  lesson,
  index,
  dragHandleProps,
  onFileChange,
  onFileRemove,
  onToggleExpanded,
  onDirectUploadComplete,
}: LessonEditorProps) {
  const isExpanded = lesson.expanded ?? false;
  const [title, setTitle] = useState(lesson.title || '');
  const [description, setDescription] = useState(lesson.description || '');

  // Use React Query mutations
  const { mutate: updateLesson } = useUpdateLesson();
  const { mutate: deleteLesson } = useDeleteLesson();
  
  const handleToggle = () => {
    if (onToggleExpanded) {
      onToggleExpanded(lesson.id);
    }
  };

  const handleUpdateField = (field: keyof Lesson, value: string) => {
    if (field === 'title') {
      setTitle(value);
    } else if (field === 'description') {
      setDescription(value);
    }

    // Debounce API call for better UX
    const timer = setTimeout(() => {
      updateLesson({
        courseId,
        lessonId: lesson.id,
        data: { [field]: value }
      });
    }, 500);

    return () => clearTimeout(timer);
  };

  const handleRemoveLesson = () => {
    if (window.confirm('Are you sure you want to remove this lesson?')) {
      deleteLesson({ 
        courseId, 
        lessonId: lesson.id 
      });
    }
  };
  
  return (
    <div className="overflow-hidden border border-slate-200 rounded-lg bg-white transition-all hover:border-slate-300">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between group">
        <div className="flex items-center gap-3">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab hover:cursor-grabbing group"
            >
              <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          )}
          
          {/* Toggle expand/collapse */}
          <div 
            className="cursor-pointer p-1.5 hover:bg-slate-200 active:bg-slate-300 rounded-md transition-colors"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-slate-800 text-white rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{index + 1}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-900">
              {title || `Lesson ${index + 1}`}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault(); 
            e.stopPropagation();
            handleRemoveLesson();
          }}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-80 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content - only show when expanded */}
      {isExpanded && (
        <div className="p-5 space-y-5 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Lesson Title" required>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleUpdateField("title", e.target.value);
                }}
                placeholder="e.g. Introduction to TypeScript"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                required
              />
            </FormField>

            <FormField label="Description">
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  handleUpdateField("description", e.target.value);
                }}
                rows={3}
                placeholder="What will students learn in this lesson?"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
              />
            </FormField>
          </div>

          <FormField label="Lesson Video">
            {!lesson.file && !lesson.fileUrl && !lesson.uploading ? (
              <VideoUploader 
                lessonId={lesson.id} 
                onFileChange={onFileChange}
                onDirectUploadComplete={onDirectUploadComplete} 
              />
            ) : (
              <VideoPreview lesson={lesson} onFileRemove={onFileRemove} />
            )}
          </FormField>
        </div>
      )}
    </div>
  );
} 