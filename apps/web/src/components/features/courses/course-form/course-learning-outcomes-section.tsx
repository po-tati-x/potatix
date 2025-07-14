"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Save, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/new-button";
import { useUpdateCourse } from "@/lib/client/hooks/use-courses";
import { toast } from "sonner";

interface CourseLearningOutcomesSectionProps {
  courseId: string;
  outcomes: string[];
}

export function CourseLearningOutcomesSection({ courseId, outcomes: initialOutcomes }: CourseLearningOutcomesSectionProps) {
  const [outcomes, setOutcomes] = useState<string[]>(initialOutcomes);
  const [dirty, setDirty] = useState(false);
  const savedRef = useRef(initialOutcomes);

  useEffect(() => {
    // Sync local state when parent provides new outcomes, avoid redundant updates
    if (savedRef.current !== initialOutcomes) {
      setTimeout(() => {
        setOutcomes(initialOutcomes);
        savedRef.current = initialOutcomes;
        setDirty(false);
      }, 0);
    }
  }, [initialOutcomes]);

  const updateCourse = useUpdateCourse(courseId);

  function persist(updated: string[]) {
    updateCourse.mutate({ learningOutcomes: updated }, {
      onSuccess: () => {
        toast.success("Learning outcomes saved");
        savedRef.current = updated;
        setDirty(false);
      },
      onError: (err) => toast.error(err.message || "Failed to save"),
    });
  }

  function addOutcome() {
    setOutcomes([...outcomes, ""]);
    setDirty(true);
  }

  function updateOutcome(idx: number, value: string) {
    const next = [...outcomes];
    next[idx] = value;
    setOutcomes(next);
    setDirty(true);
  }

  function removeOutcome(idx: number) {
    const next = outcomes.filter((_, i) => i !== idx);
    setOutcomes(next);
    setDirty(true);
  }

  const isEmpty = outcomes.length === 0;

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-slate-900">What you&apos;ll learn</h2>
          <p className="text-xs text-slate-500 mt-0.5">List the key skills students will gain</p>
        </div>

        <div className="flex gap-2">
          <Button type="default" size="small" iconLeft={<Plus className="h-3.5 w-3.5" />} onClick={addOutcome}>
            Add Item
          </Button>

          <Button
            type="primary"
            size="small"
            iconLeft={<Save className="h-4 w-4" />}
            loading={updateCourse.isPending}
            disabled={updateCourse.isPending || !dirty}
            onClick={() => {
              const cleaned = outcomes.filter((o) => o.trim() !== "");
              persist(cleaned);
            }}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {updateCourse.isSuccess && !updateCourse.isPending && (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" /> Saved
          </div>
        )}

        {isEmpty ? (
          <div className="text-center py-8 space-y-1 border border-dashed border-slate-300 rounded-md">
            <p className="text-sm text-slate-600">No learning outcomes yet</p>
            <p className="text-xs text-slate-500">Click &quot;Add Item&quot; to outline what students will learn</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {outcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Input
                  value={outcome}
                  placeholder="Enter outcome"
                  onChange={(e) => updateOutcome(idx, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeOutcome(idx)}
                  className="text-red-500 hover:text-red-600 rounded p-1 hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 