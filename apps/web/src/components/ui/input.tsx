import * as React from "react";

import { cn } from "@/lib/shared/utils/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-slate-400 selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:border-input",
        "focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

export { Input };