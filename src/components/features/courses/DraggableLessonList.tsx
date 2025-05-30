"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Lesson } from "@/lib/stores/courseStore";
import {
  GripVertical,
  Trash2,
  FilmIcon,
  PlayCircle,
  ArrowUpCircle,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { Button } from "@/components/ui/potatix/Button";

// Type for the core drag and drop functionality only
interface DraggableLessonListProps {
  lessons: Lesson[];
  onReorder: (lessons: Lesson[]) => void;
  renderLesson: (
    lesson: Lesson,
    index: number,
    dragHandleProps: any,
  ) => React.ReactNode;
  emptyState?: React.ReactNode;
}

/**
 * Core drag and drop functionality only - no UI specifics
 */
export function DraggableLessonList({
  lessons,
  onReorder,
  renderLesson,
  emptyState,
}: DraggableLessonListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const reorderedItems = Array.from(lessons);
    const [removed] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destIndex, 0, removed);

    const updatedLessons = reorderedItems.map((lesson, index) => ({
      ...lesson,
      order: index,
    }));

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
            className="space-y-3"
          >
            {lessons.map((lesson, index) => (
              <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                {(provided, snapshot) => {
                  // Cast style to any to avoid TypeScript errors with DraggableStyle
                  const style = provided.draggableProps.style as React.CSSProperties;
                  
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={style}
                      className={`bg-white border rounded-md overflow-hidden transition-all ${
                        snapshot.isDragging
                          ? "border-slate-400 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {renderLesson(lesson, index, provided.dragHandleProps)}
                    </div>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// Form field component for consistency
const FormField = ({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// Types for the lesson editor component
interface LessonEditorProps {
  lesson: Lesson;
  index: number;
  dragHandleProps: any;
  onUpdateLesson: (id: string, field: keyof Lesson, value: string) => void;
  onRemoveLesson: (id: string) => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
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
  onFileRemove,
}: LessonEditorProps) {
  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div
          {...dragHandleProps}
          className="flex items-center gap-3 cursor-grab hover:cursor-grabbing group"
        >
          <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-slate-700 text-white rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{index + 1}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-900">
              {lesson.title || `Lesson ${index + 1}`}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemoveLesson(lesson.id)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Lesson Title" required>
            <input
              type="text"
              value={lesson.title}
              onChange={(e) =>
                onUpdateLesson(lesson.id, "title", e.target.value)
              }
              placeholder="e.g. Introduction to TypeScript"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              required
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={lesson.description}
              onChange={(e) =>
                onUpdateLesson(lesson.id, "description", e.target.value)
              }
              rows={3}
              placeholder="What will students learn in this lesson?"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
            />
          </FormField>
        </div>

        <FormField label="Lesson Video">
          {!lesson.file && !lesson.videoId ? (
            <VideoUploader lessonId={lesson.id} onFileChange={onFileChange} />
          ) : (
            <VideoPreview lesson={lesson} onFileRemove={onFileRemove} />
          )}
        </FormField>
      </div>
    </div>
  );
}

// Video uploader component
interface VideoUploaderProps {
  lessonId: string;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
}

export function VideoUploader({ lessonId, onFileChange }: VideoUploaderProps) {
  const [isAdvancedUpload, setIsAdvancedUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUploadUrl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mux/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const data = await response.json();
      setUploadUrl(data.url);
      setIsAdvancedUpload(true);
    } catch (err) {
      console.error("Error getting upload URL:", err);
      setError("Failed to initialize uploader. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (data: any) => {
    console.log("Upload success:", data);
  };

  // Advanced uploader
  if (isAdvancedUpload && uploadUrl) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
          <h4 className="text-xs font-medium text-slate-700">
            Direct Upload
          </h4>
        </div>
        <div className="p-4">
          <MuxUploader
            endpoint={uploadUrl}
            onSuccess={handleUploadSuccess}
            className="mux-uploader"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Video will be processed automatically after upload
            </p>
            <button
              onClick={() => setIsAdvancedUpload(false)}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Switch to basic uploader
            </button>
          </div>
        </div>

        <style jsx global>{`
          .mux-uploader {
            --mux-uploader-background: #ffffff;
            --mux-uploader-drag-background: #f8fafc;
            --mux-uploader-border: 1px dashed #d1d5db;
            --mux-uploader-border-radius: 0.375rem;
            --mux-uploader-primary-color: #334155;
            width: 100%;
            min-height: 100px;
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <div>
            <p className="text-xs font-medium text-red-700">Upload Error</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
        <Button
          type="outline"
          size="small"
          icon={<AlertCircle className="h-3.5 w-3.5" />}
          onClick={getUploadUrl}
          className="mt-3 bg-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="border border-slate-200 rounded-md p-6 text-center">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-600">Initializing uploader...</p>
      </div>
    );
  }

  // Upload options
  return (
    <div className="space-y-3">
      {/* Direct uploader option */}
      <div className="border border-slate-200 rounded-md p-4 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-3">
          <ArrowUpCircle className="h-5 w-5 text-slate-600" />
        </div>
        <h4 className="text-sm font-medium text-slate-900 mb-1">
          Direct Upload
        </h4>
        <p className="text-xs text-slate-500 mb-3 max-w-md mx-auto">
          Recommended for large files. Supports resumable uploads.
        </p>
        <Button
          type="primary"
          size="small"
          icon={<ArrowUpCircle className="h-3.5 w-3.5" />}
          onClick={getUploadUrl}
        >
          Initialize Direct Upload
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-slate-500">or</span>
        </div>
      </div>

      {/* Basic file input */}
      <div className="border border-dashed border-slate-300 rounded-md p-5 text-center hover:border-slate-400 transition-colors">
        <input
          type="file"
          id={`video-upload-${lessonId}`}
          className="hidden"
          accept="video/*"
          onChange={(e) => onFileChange(e, lessonId)}
        />

        <label
          htmlFor={`video-upload-${lessonId}`}
          className="flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
            <Upload className="h-5 w-5 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">
            Upload video file
          </p>
          <p className="text-xs text-slate-500">MP4, MOV or WebM up to 2GB</p>
        </label>
      </div>
    </div>
  );
}

interface VideoPreviewProps {
  lesson: Lesson;
  onFileRemove: (lessonId: string) => void;
}

export function VideoPreview({ lesson, onFileRemove }: VideoPreviewProps) {
  // Already uploaded video (has videoId)
  if (lesson.videoId) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="relative aspect-video bg-black group">
          <img
            src={`https://image.mux.com/${lesson.videoId}/thumbnail.jpg?width=1920&height=1080&fit_mode=preserve`}
            alt={`Preview for ${lesson.title}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-60 rounded-full p-3 group-hover:bg-opacity-80 transition-all">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-slate-900">
                Video uploaded
              </span>
            </div>

            <button
              type="button"
              onClick={() => onFileRemove(lesson.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // In-progress upload
  return (
    <div className="border border-slate-200 rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FilmIcon className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-xs font-medium text-slate-900 truncate max-w-xs">
              {lesson.fileName}
            </p>
            <p className="text-xs text-slate-500">{lesson.fileSize}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onFileRemove(lesson.id)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">
            {lesson.progress === 100 ? "Processing..." : "Uploading..."}
          </span>
          <span className="text-slate-900 font-medium">
            {lesson.progress}%
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${lesson.progress}%` }}
          />
        </div>
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
    <div className="text-center py-8 border border-dashed border-slate-300 rounded-md bg-slate-50">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-4">
        <FilmIcon className="h-5 w-5 text-slate-500" />
      </div>

      <h3 className="text-sm font-medium text-slate-900 mb-1">
        No lessons yet
      </h3>
      <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
        Start building your course by adding your first lesson with video content.
      </p>

      {onAddLesson && (
        <Button
          type="primary"
          size="small"
          icon={<Plus className="h-3.5 w-3.5" />}
          onClick={onAddLesson}
        >
          Add Your First Lesson
        </Button>
      )}
    </div>
  );
}

// Main composite component
interface CourseLessonEditorProps {
  lessons: Lesson[];
  onUpdateLesson: (id: string, field: keyof Lesson, value: string) => void;
  onRemoveLesson: (id: string) => void;
  onReorder: (lessons: Lesson[]) => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
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
    addLesson,
  } = props;

  return (
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
  );
}
