"use client";

import { memo } from "react";

function SidebarFooter() {
  return (
    <div className="p-4 border-t border-slate-200 bg-slate-50">
      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
        <p className="text-xs text-slate-700">
          Potatix is a performance oriented LMS</p>
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(SidebarFooter);
