"use client";

// Form field component for consistency
export const FormField = ({
  label,
  children,
  required = false,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 mt-1">{error}</p>
    )}
  </div>
); 