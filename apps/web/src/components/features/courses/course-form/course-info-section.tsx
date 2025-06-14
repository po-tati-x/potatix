import { useEffect, useRef, useState } from "react";
import { Check, Save } from "lucide-react";
import { toast } from "sonner";

import { useUpdateCourse } from "@/lib/client/hooks/use-courses";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/new-button";

interface CourseInfoSectionProps {
  courseId: string;
  title: string;
  description: string;
  price: number;
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
  const [price, setPrice] = useState(initialPrice);

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
    setPrice(initialPrice);
    savedPrice.current = initialPrice;
  }, [initialPrice]);

  // Change handler updates local + parent but does NOT auto-save
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "title") setTitle(value);
    if (name === "description") setDescription(value);
    if (name === "price") setPrice(parseFloat(value) || 0);

    setDirty(true);

    onChange?.(e);
  };

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
            updateCourse.mutate(
              { title, description, price },
              {
                onSuccess: () => {
                  toast.success("Course updated");
                  // update baseline refs to current values
                  savedTitle.current = title;
                  savedDescription.current = description;
                  savedPrice.current = price;
                  setDirty(false);
                },
                onError: (err) => toast.error(err.message || "Failed to update"),
              },
            );
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
          <input
            name="title"
            type="text"
            required
            value={title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
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
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={handleChange}
              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="0.00"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}
