import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Save, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/new-button";
import { toast } from "sonner";
import { useUpdateCourse } from "@/lib/client/hooks/use-courses";

interface StringListSectionProps {
  courseId: string;
  /** Array from the server */
  items: string[];
  /** Key in the Course object (e.g., "perks", "learningOutcomes", "prerequisites") */
  field: "perks" | "learningOutcomes" | "prerequisites";
  /** Heading displayed in the UI */
  heading: string;
}

export function StringListSection({ courseId, items: initialItems, field, heading }: StringListSectionProps) {
  const [items, setItems] = useState<string[]>(initialItems);
  const [dirty, setDirty] = useState(false);
  const savedRef = useRef(initialItems);

  // Sync when props update from parent (e.g. after refetch)
  useEffect(() => {
    setItems(initialItems);
    savedRef.current = initialItems;
    setDirty(false);
  }, [initialItems]);

  const updateCourse = useUpdateCourse(courseId);

  function addItem() {
    setItems([...items, ""]);
    setDirty(true);
  }

  function updateItem(idx: number, value: string) {
    const next = items.slice();
    next[idx] = value;
    setItems(next);
    setDirty(true);
  }

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    setDirty(true);
  }

  function save() {
    // strip empty
    const cleaned = items.filter((i) => i.trim() !== "");
    updateCourse.mutate({ [field]: cleaned } as any, {
      onSuccess: () => {
        toast.success("Saved");
        savedRef.current = cleaned;
        setDirty(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to save");
      },
    });
  }

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-slate-900">{heading}</h2>

        <Button
          type="primary"
          size="small"
          iconLeft={<Save className="h-4 w-4" />}
          loading={updateCourse.isPending}
          disabled={updateCourse.isPending || !dirty}
          onClick={save}
        >
          Save
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {updateCourse.isSuccess && !updateCourse.isPending && (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" /> Saved
          </div>
        )}

        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Input
                value={item}
                placeholder="Enter text"
                onChange={(e) => updateItem(idx, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 hover:text-red-600 rounded p-1 hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <Button type="default" size="small" iconLeft={<Plus className="h-4 w-4" />} onClick={addItem}>
          Add Item
        </Button>
      </div>
    </div>
  );
} 