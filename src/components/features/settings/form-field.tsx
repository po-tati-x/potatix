interface FormFieldProps { 
  label: string; 
  children: React.ReactNode; 
  required?: boolean;
  description?: string;
  error?: string | null;
}

export function FormField({ label, children, required = false, description, error }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 