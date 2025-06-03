import { FormField } from "@/components/ui/potatix/form-field";

interface CourseInfoSectionProps {
  title: string;
  description: string;
  price: number;
  validationErrors?: {
    title?: string;
    description?: string;
    price?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CourseInfoSection({
  title,
  description,
  price,
  validationErrors = {},
  onChange,
}: CourseInfoSectionProps) {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">Course Information</h2>
      </div>

      <div className="p-4 space-y-4">
        <FormField 
          label="Course Title" 
          required 
          error={validationErrors.title}
        >
          <input
            name="title"
            type="text"
            required
            value={title}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="Enter a compelling course title"
          />
        </FormField>

        <FormField 
          label="Description"
          error={validationErrors.description}
        >
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
            placeholder="Describe what students will learn in this course"
          />
        </FormField>

        <FormField 
          label="Price" 
          required
          error={validationErrors.price}
        >
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
              onChange={onChange}
              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="0.00"
            />
          </div>
        </FormField>
      </div>
    </div>
  );
} 