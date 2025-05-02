"use client";

import { Bell } from "lucide-react"; 

export function NewsComponent() {
  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-3 text-sm">
        <Bell className="size-4 flex-shrink-0 text-neutral-400" />
        <p className="line-clamp-2 text-neutral-600">
          Latest updates
        </p>
      </div>
    </div>
  );
} 