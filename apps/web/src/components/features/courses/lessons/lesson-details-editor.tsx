"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/new-button";
import { Switch } from "@/components/ui/switch";
import { useUpdateLesson } from "@/lib/client/hooks/use-courses";
import type { Lesson } from "@/lib/shared/types/courses";

interface LessonDetailsEditorProps {
  courseId: string;
  lesson: Lesson;
}

/**
 * Stand-alone editor for lesson meta (title, description, visibility).
 */
export function LessonDetailsEditor({ courseId, lesson }: LessonDetailsEditorProps) {
  const [title, setTitle] = useState(lesson.title || "");
  const [description, setDescription] = useState(lesson.description || "");
  const [visibility, setVisibility] = useState<'public' | 'enrolled'>(lesson.visibility || "enrolled");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLessonMutation = useUpdateLesson();
  const isSaving = updateLessonMutation.isPending;

  // Reset local state if lesson prop changes (refetch)
  useEffect(() => {
    setTitle(lesson.title || "");
    setDescription(lesson.description || "");
    setVisibility(lesson.visibility || "enrolled");
    setDirty(false);
  }, [lesson.id, lesson.title, lesson.description, lesson.visibility]);

  const handleSave = async () => {
    if (isSaving) return;
    try {
      await updateLessonMutation.mutateAsync({
        lessonId: lesson.id,
        title,
        description,
        visibility,
        courseId,
      });
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    }
  };

  const handleCancel = () => {
    setTitle(lesson.title || "");
    setDescription(lesson.description || "");
    setVisibility(lesson.visibility || "enrolled");
    setDirty(false);
  };

  return (
    <div className="border border-slate-200 rounded-md bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">Lesson Details</h2>
        <div className="flex gap-2">
          <Button
            type="primary"
            size="tiny"
            disabled={!dirty || isSaving}
            loading={isSaving}
            aria-busy={isSaving}
            onClick={handleSave}
          >
            Save
          </Button>
          {dirty && (
            <Button
              type="outline"
              size="tiny"
              disabled={isSaving}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-200">{error}</p>
      )}

      {/* Form fields */}
      <div className="p-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Lesson Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            placeholder="e.g. Advanced TypeScript Types"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
            rows={4}
            placeholder="What will students learn in this lesson?"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id={`visibility-switch-${lesson.id}`}
            checked={visibility === "public"}
            onCheckedChange={(checked) => {
              setVisibility(checked ? "public" : "enrolled");
              setDirty(true);
            }}
            className="data-[state=checked]:bg-emerald-600"
          />
          <label htmlFor={`visibility-switch-${lesson.id}`} className="text-sm text-slate-700 select-none">
            {visibility === "public" ? "Public Preview" : "Enrolled Only"}
          </label>
        </div>
      </div>
    </div>
  );
} 