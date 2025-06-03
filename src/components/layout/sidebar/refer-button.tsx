"use client";

import { Gift } from "lucide-react";

export function ReferButton() {
  return (
    <button className="flex items-center text-sm text-neutral-600 gap-2 rounded-md p-1.5 hover:bg-neutral-200/50">
      <Gift className="size-4" />
    </button>
  );
} 