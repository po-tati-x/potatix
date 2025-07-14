"use client";

import { useState, useEffect, useReducer } from "react";
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
  interface LessonFormState {
    title: string;
    description: string;
    visibility: 'public' | 'enrolled';
    dirty: boolean;
  }

  type Action =
    | { type: 'RESET'; payload: Omit<LessonFormState, 'dirty'> }
    | { type: 'SET_TITLE'; title: string }
    | { type: 'SET_DESCRIPTION'; description: string }
    | { type: 'SET_VISIBILITY'; visibility: 'public' | 'enrolled' };

  function reducer(state: LessonFormState, action: Action): LessonFormState {
    switch (action.type) {
      case 'RESET': {
        return { ...action.payload, dirty: false };
      }
      case 'SET_TITLE': {
        return { ...state, title: action.title, dirty: true };
      }
      case 'SET_DESCRIPTION': {
        return { ...state, description: action.description, dirty: true };
      }
      case 'SET_VISIBILITY': {
        return { ...state, visibility: action.visibility, dirty: true };
      }
      default: {
        return state;
      }
    }
  }

  const [form, dispatch] = useReducer(reducer, {
    title: lesson.title ?? '',
    description: lesson.description ?? '',
    visibility: lesson.visibility ?? 'enrolled',
    dirty: false,
  });

  const { title, description, visibility, dirty } = form;

  // Separate error state (undefined instead of null per eslint rule)
  const [error, setError] = useState<string | undefined>();

  const updateLessonMutation = useUpdateLesson();
  const isSaving = updateLessonMutation.isPending;

  // Sync local draft when the lesson prop changes (e.g., refetch)
  useEffect(() => {
    dispatch({
      type: 'RESET',
      payload: {
        title: lesson.title ?? '',
        description: lesson.description ?? '',
        visibility: lesson.visibility ?? 'enrolled',
      },
    });
  }, [lesson.id, lesson.title, lesson.description, lesson.visibility]);

  const handleSave = async (): Promise<void> => {
    if (isSaving) return;
    try {
      await updateLessonMutation.mutateAsync({
        lessonId: lesson.id,
        title,
        description,
        visibility,
        courseId,
      });
      dispatch({
        type: 'RESET',
        payload: { title, description, visibility },
      });
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : 'Failed to save changes',
      );
    }
  };

  const handleCancel = () => {
    dispatch({
      type: 'RESET',
      payload: {
        title: lesson.title ?? '',
        description: lesson.description ?? '',
        visibility: lesson.visibility ?? 'enrolled',
      },
    });
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
            onClick={() => {
              void handleSave();
            }}
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
        {(() => {
          const id = `lesson-title-${lesson.id}`;
          return (
            <>
              <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Lesson Title
              </label>
              <input
                id={id}
                type="text"
                value={title}
                onChange={(e) => {
                  dispatch({ type: 'SET_TITLE', title: e.target.value });
                }}
                placeholder="e.g. Advanced TypeScript Types"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </>
          );
        })()}

        {(() => {
          const id = `lesson-description-${lesson.id}`;
          return (
            <>
              <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id={id}
                value={description}
                onChange={(e) => {
                  dispatch({
                    type: 'SET_DESCRIPTION',
                    description: e.target.value,
                  });
                }}
                rows={4}
                placeholder="What will students learn in this lesson?"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </>
          );
        })()}

        <div className="flex items-center gap-3">
          <Switch
            id={`visibility-switch-${lesson.id}`}
            checked={visibility === "public"}
            onCheckedChange={(checked) => {
              dispatch({
                type: 'SET_VISIBILITY',
                visibility: checked ? 'public' : 'enrolled',
              });
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