import { useEffect, useRef, useState } from "react";
import { Check, Save } from "lucide-react";
import { toast } from "sonner";

import { useUpdateCourse } from "@/lib/client/hooks/use-courses";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/new-button";
import { Input } from "@/components/ui/input";
import type { CreateCourseData } from "@/lib/shared/types/courses";

interface CourseInfoSectionProps {
  courseId: string;
  title: string;
  description: string;
  price: number;
  slug: string;
  validationErrors?: {
    title?: string;
    description?: string;
    price?: string;
  };
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export function CourseInfoSection({
  courseId,
  title: initialTitle,
  description: initialDescription,
  price: initialPrice,
  validationErrors = {},
  onChange,
}: CourseInfoSectionProps) {

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  // Use string to allow empty editing state
  const [priceInput, setPriceInput] = useState(
    initialPrice > 0 ? initialPrice.toString() : ""
  );

  // Track unsaved changes irrespective of parent prop sync
  const [dirty, setDirty] = useState(false);

  // keep refs for last saved values to determine dirty if needed in future
  const savedTitle = useRef(initialTitle);
  const savedDescription = useRef(initialDescription);
  const savedPrice = useRef(initialPrice);

  const updateCourse = useUpdateCourse(courseId);

  // Sync local state when parent props change (e.g., after fetch)
  useEffect(() => {
    setTitle(initialTitle);
    savedTitle.current = initialTitle;
  }, [initialTitle]);

  useEffect(() => {
    setDescription(initialDescription);
    savedDescription.current = initialDescription;
  }, [initialDescription]);

  useEffect(() => {
    setPriceInput(initialPrice > 0 ? initialPrice.toString() : "");
    savedPrice.current = initialPrice;
  }, [initialPrice]);

  // Change handler updates local + parent but does NOT auto-save
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "title") setTitle(value);
    if (name === "description") setDescription(value);
    if (name === "price") {
      const sanitized = sanitizePriceInput(value);
      setPriceInput(sanitized);
    }

    setDirty(true);

    onChange?.(e);
  };

  // Sanitize price input: allow digits and single dot, no leading zeros unless decimal
  function sanitizePriceInput(input: string): string {
    // Remove non-digit/dot characters
    let cleaned = input.replace(/[^\d.]/g, "");

    // Keep only first dot
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      const beforeDot = cleaned.slice(0, firstDot);
      const afterDot = cleaned.slice(firstDot + 1).replace(/\./g, "");
      cleaned = `${beforeDot}.${afterDot}`;
    }

    // If starts with dot, prefix 0
    if (cleaned.startsWith(".")) cleaned = `0${cleaned}`;

    // Remove leading zeros (but preserve single 0 or 0.xxx)
    const parts = cleaned.split(".");
    if (parts[0] && parts[0].length > 1) {
      parts[0] = parts[0].replace(/^0+/, "");
    }
    cleaned = parts.join(".");

    return cleaned;
  }

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-slate-900">Course Information</h2>

        <Button
          type="primary"
          size="small"
          iconLeft={<Save className="h-4 w-4" />}
          loading={updateCourse.isPending}
          disabled={updateCourse.isPending || !dirty}
          onClick={() => {
            const payload: Partial<CreateCourseData> = {};
            if (title !== savedTitle.current) payload.title = title;
            if (description !== savedDescription.current) payload.description = description;
            const newPrice = parseFloat(priceInput) || 0;
            if (newPrice !== savedPrice.current) payload.price = newPrice;

            if (Object.keys(payload).length === 0) {
              toast.info("No changes to save");
              setDirty(false);
              return;
            }

            updateCourse.mutate(payload, {
              onSuccess: () => {
                toast.success("Course updated");
                // update baseline refs to current values
                if (payload.title) savedTitle.current = payload.title;
                if (payload.description) savedDescription.current = payload.description;
                if (payload.price !== undefined) savedPrice.current = payload.price;
                setDirty(false);
              },
              onError: (err) => toast.error(err.message || "Failed to update"),
            });
          }}
        >
          Save
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* save status */}
        {updateCourse.isSuccess && !updateCourse.isPending && (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" /> Saved
          </div>
        )}

        <FormField label="Course Title" required error={validationErrors.title}>
          <Input
            name="title"
            type="text"
            required
            value={title}
            onChange={handleChange}
            placeholder="Enter a compelling course title"
          />
        </FormField>

        <FormField label="Description" error={validationErrors.description}>
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
            placeholder="Describe what students will learn in this course"
          />
        </FormField>

        <FormField label="Price" required error={validationErrors.price}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-500 sm:text-sm">$</span>
            </div>
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              value={priceInput}
              onChange={handleChange}
              className="pl-7 pr-3"
              placeholder="0.00"
              inputMode="decimal"
              pattern="\\d*(\\.\\d*)?"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
