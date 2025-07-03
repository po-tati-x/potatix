"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Save, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/new-button";
import { useUpdateCourse } from "@/lib/client/hooks/use-courses";
import { toast } from "sonner";

interface CoursePerksSectionProps {
  courseId: string;
  perks: string[];
}

export function CoursePerksSection({ courseId, perks: initialPerks }: CoursePerksSectionProps) {
  /* ------------------------------------------------------------------ */
  /*  State                                                             */
  /* ------------------------------------------------------------------ */

  const [perks, setPerks] = useState<string[]>(initialPerks);
  const [dirty, setDirty] = useState(false);
  const savedRef = useRef(initialPerks);

  /* ------------------------------------------------------------------ */
  /*  Sync when parent data refreshes                                   */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    setPerks(initialPerks);
    savedRef.current = initialPerks;
    setDirty(false);
  }, [initialPerks]);

  /* ------------------------------------------------------------------ */
  /*  Mutations                                                         */
  /* ------------------------------------------------------------------ */

  const updateCourse = useUpdateCourse(courseId);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                          */
  /* ------------------------------------------------------------------ */

  function addPerk() {
    setPerks([...perks, ""]);
    setDirty(true);
  }

  function updatePerk(idx: number, value: string) {
    const next = perks.slice();
    next[idx] = value;
    setPerks(next);
    setDirty(true);
  }

  function removePerk(idx: number) {
    const next = perks.filter((_, i) => i !== idx);
    setPerks(next);
    setDirty(true);
  }

  function persist(updated: string[]) {
    updateCourse.mutate({ perks: updated }, {
      onSuccess: () => {
        toast.success("Course perks saved");
        savedRef.current = updated;
        setDirty(false);
      },
      onError: (err) => toast.error(err.message || "Failed to save"),
    });
  }

  /* ------------------------------------------------------------------ */
  /*  UI                                                                */
  /* ------------------------------------------------------------------ */

  const isEmpty = perks.length === 0;

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-slate-900">Course Perks</h2>
          <p className="text-xs text-slate-500 mt-0.5">Highlight bonuses and extras your students receive</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="default"
            size="small"
            iconLeft={<Plus className="h-3.5 w-3.5" />}
            onClick={addPerk}
          >
            Add Perk
          </Button>

          <Button
            type="primary"
            size="small"
            iconLeft={<Save className="h-4 w-4" />}
            loading={updateCourse.isPending}
            disabled={updateCourse.isPending || !dirty}
            onClick={() => {
              const cleaned = perks.filter((p) => p.trim() !== "");
              persist(cleaned);
            }}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Saved indicator */}
        {updateCourse.isSuccess && !updateCourse.isPending && (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" /> Saved
          </div>
        )}

        {/* Empty state */}
        {isEmpty ? (
          <div className="text-center py-8 space-y-1 border border-dashed border-slate-300 rounded-md">
            <p className="text-sm text-slate-600">No perks yet</p>
            <p className="text-xs text-slate-500">Click &quot;Add Perk&quot; to list the benefits</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {perks.map((perk, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Input
                  value={perk}
                  placeholder="Enter perk"
                  onChange={(e) => updatePerk(idx, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removePerk(idx)}
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