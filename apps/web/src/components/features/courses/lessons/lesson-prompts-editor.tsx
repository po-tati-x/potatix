import { useState } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { useUpdateLesson } from "@/lib/client/hooks/use-courses";
import type { Lesson } from "@/lib/shared/types/courses";

interface LessonPromptsEditorProps {
  courseId: string;
  lesson: Lesson;
}

/**
 * Editor for AI chat prompts stored on a lesson (aiPrompts column)
 */
export function LessonPromptsEditor({ courseId, lesson }: LessonPromptsEditorProps) {
  const originalPrompts: string[] = (lesson as any).aiPrompts ?? [];
  const [prompts, setPrompts] = useState<string[]>(originalPrompts);
  const [dirty, setDirty] = useState(false);

  const { mutate: updateLesson } = useUpdateLesson();

  const markDirty = () => setDirty(true);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                          */
  /* ------------------------------------------------------------------ */
  const addPrompt = () => {
    setPrompts([...prompts, "New prompt"]);
    markDirty();
  };

  const removePrompt = (idx: number) => {
    setPrompts(prompts.filter((_, i) => i !== idx));
    markDirty();
  };

  const movePrompt = (from: number, to: number) => {
    if (to < 0 || to >= prompts.length) return;
    const updated = [...prompts];
    const [moved] = updated.splice(from, 1);
    if (moved === undefined) return;
    updated.splice(to, 0, moved);
    setPrompts(updated);
    markDirty();
  };

  const updatePrompt = (idx: number, value: string) => {
    setPrompts((prev) => prev.map((p, i) => (i === idx ? value : p)));
    markDirty();
  };

  const handleSave = () => {
    updateLesson({
      lessonId: lesson.id,
      courseId,
      // @ts-expect-error extra field
      aiPrompts: prompts,
    });
    setDirty(false);
  };

  const handleCancel = () => {
    setPrompts(originalPrompts);
    setDirty(false);
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="border border-slate-200 rounded-md bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">AI Chat Prompts</h2>
        <div className="flex gap-2">
          <Button type="outline" size="tiny" iconLeft={<Plus className="h-3 w-3" />} onClick={addPrompt}>
            Add
          </Button>
          <Button type="primary" size="tiny" disabled={!dirty} iconLeft={<Save className="h-3 w-3" />} onClick={handleSave}>
            Save
          </Button>
          {dirty && (
            <Button type="outline" size="tiny" iconLeft={<X className="h-3 w-3" />} onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {prompts.map((prompt, idx) => (
          <li key={idx} className="p-4 flex items-start gap-3">
            {/* Reorder */}
            <div className="flex flex-col gap-1 pt-1">
              <button
                aria-label="Move up"
                onClick={() => movePrompt(idx, idx - 1)}
                disabled={idx === 0}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                aria-label="Move down"
                onClick={() => movePrompt(idx, idx + 1)}
                disabled={idx === prompts.length - 1}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              value={prompt}
              onChange={(e) => updatePrompt(idx, e.target.value)}
              className="flex-grow border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

            {/* Delete */}
            <button
              aria-label="Delete prompt"
              onClick={() => removePrompt(idx)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}

        {prompts.length === 0 && (
          <li className="p-4 text-center text-sm text-slate-500">No prompts. Add one.</li>
        )}
      </ul>
    </div>
  );
} 