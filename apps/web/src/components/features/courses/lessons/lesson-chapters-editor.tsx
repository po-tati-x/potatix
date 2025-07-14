import { useState } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2, Save, X, RefreshCw, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/new-button";
import { useUpdateLesson } from "@/lib/client/hooks/use-courses";
import { z } from "zod";
import type { Lesson } from "@/lib/shared/types/courses";

interface Chapter {
  id: string;
  title: string;
  description: string;
  timestamp: number;
}

interface LessonChaptersEditorProps {
  courseId: string;
  lesson: Lesson;
}

/**
 * Editable list of chapters for a lesson.
 * Allows adding / removing / re-ordering and persisting via updateLesson.
 */
export function LessonChaptersEditor({ courseId, lesson }: LessonChaptersEditorProps) {
  const originalChapters: Chapter[] = lesson.transcriptData?.chapters ?? [];

  const [chapters, setChapters] = useState<Chapter[]>(originalChapters);
  const [dirty, setDirty] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | undefined>();

  const { mutate: updateLesson } = useUpdateLesson();

  const markDirty = () => setDirty(true);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                          */
  /* ------------------------------------------------------------------ */
  const addChapter = () => {
    const nextTimestamp =
      chapters.length > 0 ? chapters.at(-1)!.timestamp + 30 : 0;
    setChapters([
      ...chapters,
      {
        id: nanoid(6),
        title: "New Chapter",
        description: "",
        timestamp: nextTimestamp,
      },
    ]);
    markDirty();
  };

  const removeChapter = (id: string) => {
    setChapters(chapters.filter((c) => c.id !== id));
    markDirty();
  };

  const moveChapter = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= chapters.length) return;
    const updated = [...chapters];
    const [moved] = updated.splice(fromIdx, 1);
    if (!moved) return;
    updated.splice(toIdx, 0, moved);
    setChapters(updated);
    markDirty();
  };

  const updateField = (
    id: string,
    field: keyof Chapter,
    value: string | number,
  ) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
    markDirty();
  };

  const handleSave = () => {
    updateLesson({
      lessonId: lesson.id,
      courseId,
      transcriptData: {
        ...lesson.transcriptData,
        chapters,
      },
    });
    setDirty(false);
  };

  const handleCancel = () => {
    setChapters(originalChapters);
    setDirty(false);
  };

  /* AI generate chapters */
  const handleGenerate = async (): Promise<void> => {
    if (!lesson.playbackId) return;
    try {
      setIsGenerating(true);
      setGenError(undefined);
      const res = await fetch(
        `/api/ai/transcript?playbackId=${lesson.playbackId}&lessonId=${lesson.id}`,
      );

      const json: unknown = await res.json();

      if (!res.ok) {
        const isErrorResponse = (data: unknown): data is { error: string } =>
          typeof data === 'object' && !!data && 'error' in data && typeof (data as Record<string, unknown>).error === 'string';

        const msg = isErrorResponse(json) ? json.error : 'Failed to generate chapters';
        throw new Error(msg);
      }

      /* -------------------------------------------------------------- */
      /*  Validate response shape                                       */
      /* -------------------------------------------------------------- */
      const schema = z.object({
        chapters: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            timestamp: z.number(),
          }),
        ),
      });

      const parsed = schema.parse(json);

      const baseTranscript = lesson.transcriptData ?? {
        textLength: 0,
        duration: 0,
        processedAt: new Date().toISOString(),
      };

      const newTranscriptData: Lesson["transcriptData"] = {
        ...baseTranscript,
        chapters: parsed.chapters,
      };

      setChapters(parsed.chapters);
      updateLesson({ lessonId: lesson.id, courseId, transcriptData: newTranscriptData });

      setDirty(false);
    } catch (error) {
      setGenError(error instanceof Error ? error.message : "Failed to generate chapters");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="border border-slate-200 rounded-md bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">Video Chapters</h2>
        <div className="flex gap-2">
          <Button
            type="outline"
            size="tiny"
            iconLeft={isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            onClick={() => void handleGenerate()}
            disabled={isGenerating || !lesson.playbackId}
          >
            {isGenerating ? "Generating" : "Generate"}
          </Button>
          <Button
            type="outline"
            size="tiny"
            iconLeft={<Plus className="h-3 w-3" />}
            onClick={addChapter}
          >
            Add
          </Button>
          <Button
            type="primary"
            size="tiny"
            disabled={!dirty}
            iconLeft={<Save className="h-3 w-3" />}
            onClick={handleSave}
          >
            Save
          </Button>
          {dirty && (
            <Button
              type="outline"
              size="tiny"
              iconLeft={<X className="h-3 w-3" />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {genError && (
        <p className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-200">{genError}</p>
      )}

      {/* List */}
      <ul className="divide-y divide-slate-100">
        {chapters.map((chapter, idx) => (
          <li key={chapter.id} className="p-4 space-y-2">
            <div className="flex items-start gap-3">
              {/* Order / Reorder buttons */}
              <div className="flex flex-col gap-1 pt-1">
                <button
                  aria-label="Move up"
                  onClick={() => moveChapter(idx, idx - 1)}
                  disabled={idx === 0}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  aria-label="Move down"
                  onClick={() => moveChapter(idx, idx + 1)}
                  disabled={idx === chapters.length - 1}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              {/* Fields */}
              <div className="flex-grow space-y-2">
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => updateField(chapter.id, "title", e.target.value)}
                  placeholder="Chapter title"
                  className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <textarea
                  rows={2}
                  value={chapter.description}
                  onChange={(e) => updateField(chapter.id, "description", e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
                <div className="flex items-center gap-2">
                  <label htmlFor={`timestamp-${chapter.id}`} className="text-xs text-slate-600">Timestamp (sec)</label>
                  <input
                    id={`timestamp-${chapter.id}`}
                    type="number"
                    min={0}
                    value={chapter.timestamp}
                    onChange={(e) => updateField(chapter.id, "timestamp", Number(e.target.value))}
                    className="w-24 border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Delete */}
              <button
                aria-label="Delete chapter"
                onClick={() => removeChapter(chapter.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}

        {chapters.length === 0 && (
          <li className="p-4 text-center text-sm text-slate-500">No chapters. Add one.</li>
        )}
      </ul>
    </div>
  );
} 