"use client"

import { Button } from "@/components/ui/shadcn/button";
import { MessageSquare } from "lucide-react";

export default function UserSurveyButton() {
  return (
    <div className="px-3 pb-3">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2 text-sm text-neutral-600 border-dashed hover:bg-neutral-200/50"
        onClick={() => alert("Feedback survey clicked")}
      >
        <MessageSquare className="size-4" />
        Share feedback
      </Button>
    </div>
  );
} 