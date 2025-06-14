import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface StatusBadgeProps {
  status: "draft" | "published" | "archived";
  onChange: (status: "draft" | "published" | "archived") => void;
}

export function StatusBadge({ status, onChange }: StatusBadgeProps) {
  const statusOptions = {
    draft: "bg-amber-50 text-amber-700 border border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    archived: "bg-slate-50 text-slate-600 border border-slate-200",
  };

  const statusStyles = statusOptions[status] || statusOptions.archived;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`px-3 py-1 text-sm font-medium rounded-md flex items-center gap-1.5 ${statusStyles} transition-colors duration-150 group`}
        >
          <span className="capitalize">{status}</span>
          <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-32 bg-white rounded-md shadow-lg border border-slate-100 overflow-hidden p-0.5"
        sideOffset={4}
        avoidCollisions
        collisionPadding={8}
      >
        <DropdownMenuItem
          className={`${status === "draft" ? "bg-amber-50 text-amber-700" : "text-slate-700"} capitalize transition-colors duration-150 hover:bg-amber-50 hover:text-amber-700 rounded-sm`}
          onClick={() => onChange("draft")}
        >
          Draft
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${status === "published" ? "bg-emerald-50 text-emerald-700" : "text-slate-700"} capitalize transition-colors duration-150 hover:bg-emerald-50 hover:text-emerald-700 rounded-sm`}
          onClick={() => onChange("published")}
        >
          Published
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`${status === "archived" ? "bg-slate-50 text-slate-600" : "text-slate-700"} capitalize transition-colors duration-150 hover:bg-slate-50 hover:text-slate-600 rounded-sm`}
          onClick={() => onChange("archived")}
        >
          Archived
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
