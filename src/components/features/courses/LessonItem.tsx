"use client";

import { Upload, X, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Lesson } from "@/lib/stores/courseStore";

// Keep the LessonData interface for backward compatibility
export type LessonData = Lesson;

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (id: string, field: keyof Lesson, value: string) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => void;
  onFileRemove: (lessonId: string) => void;
}

export function LessonItem({
  lesson,
  index,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
  onFileChange,
  onFileRemove,
}: LessonItemProps) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-700">
              {index + 1}
            </span>
          </div>
          <h4 className="font-medium text-neutral-800">
            {lesson.title || "Untitled Lesson"}
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          {!isFirst && (
            <button
              type="button"
              onClick={() => onMove(index, "up")}
              className="p-1 text-neutral-500 hover:text-neutral-700"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={() => onMove(index, "down")}
              className="p-1 text-neutral-500 hover:text-neutral-700"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(lesson.id)}
            className="p-1 text-neutral-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => onUpdate(lesson.id, "title", e.target.value)}
            placeholder="e.g. Introduction to TypeScript"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={lesson.description}
            onChange={(e) => onUpdate(lesson.id, "description", e.target.value)}
            rows={2}
            placeholder="What will students learn in this lesson?"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Lesson Video
          </label>

          {!lesson.file ? (
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
              <input
                type="file"
                id={`video-upload-${lesson.id}`}
                className="hidden"
                accept="video/*"
                onChange={(e) => onFileChange(e, lesson.id)}
              />

              <label
                htmlFor={`video-upload-${lesson.id}`}
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-700">
                  Upload video for this lesson
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  MP4, MOV or WebM up to 2GB
                </p>
              </label>
            </div>
          ) : (
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
                  <X className="h-4 w-4" />
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
                  {lesson.progress === 100 ? "Completed" : "Uploading..."}
                </span>
                <span className="text-neutral-500">{lesson.progress}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
