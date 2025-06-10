import { AlertTriangle } from "lucide-react";

interface CourseErrorAlertProps {
  error: string;
}

export function CourseErrorAlert({ error }: CourseErrorAlertProps) {
  if (!error) return null;
  
  return (
    <div className="mb-5 border border-red-200 bg-red-50 rounded-md p-3">
      <div className="flex">
        <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    </div>
  );
} 