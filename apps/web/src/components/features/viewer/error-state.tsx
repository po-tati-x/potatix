"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/new-button";

interface ErrorStateProps {
  title?: string;
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
}

export default function ErrorState({
  title = "Error",
  message,
  buttonText,
  buttonAction,
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-slate-50">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center text-center">
          {/* Error icon */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          {/* Error title */}
          <h2 className="text-xl font-medium text-slate-900 mb-2">{title}</h2>

          {/* Error message */}
          <p className="text-slate-600 mb-6">{message}</p>

          {/* Action button if provided */}
          {buttonText && buttonAction && (
            <Button
              type="outline"
              onClick={buttonAction}
              className="min-w-[140px]"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
