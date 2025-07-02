"use client";

import Link from "next/link";
import { memo } from "react";

function SidebarFooter() {
  return (
    <div className="p-4 border-t border-slate-200 bg-slate-50">
      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
        <p className="text-xs text-slate-700 mb-2">
          Potatix is a modern and performance oriented software built with LOVE in SF, <Link className="underline" href="https://hackclub.com">Hackclub</Link>
        </p>
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(SidebarFooter);
