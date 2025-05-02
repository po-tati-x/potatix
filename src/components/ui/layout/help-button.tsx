"use client";

import { MessageSquare } from "lucide-react";

export function HelpButton() {
  return (
    <button className="flex items-center text-sm text-neutral-600 gap-2 rounded-md p-1.5 hover:bg-neutral-200/50">
      <MessageSquare className="size-4" />
    </button>
  );
} 