"use client";

import { Loader2 } from "lucide-react";
import { COPY } from "@/lib/config/copy";

export function ProcessingBanner() {
  return (
    <div className="flex items-start gap-3 p-4 border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
      <Loader2 className="h-5 w-5 text-emerald-600 animate-spin mt-0.5" />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          {COPY.uploadProcessing}
        </p>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-xs">
          {COPY.processingDetailed}
        </p>
      </div>
    </div>
  );
} 