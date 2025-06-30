"use client";

import Link from "next/link";
import { Button } from "@/components/ui/new-button";
import { ChevronRight } from "lucide-react";
import { memo } from "react";

function SidebarFooter() {
  return (
    <div className="p-4 border-t border-slate-200 bg-slate-50">
      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
        <p className="text-xs text-slate-700 mb-2">
          Unlock all course content with a Potatix subscription
        </p>
        <Link href="/pricing">
          <Button
            type="primary"
            size="small"
            className="w-full justify-center"
            iconRight={<ChevronRight className="h-3.5 w-3.5" />}
          >
            View Plans
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(SidebarFooter);
