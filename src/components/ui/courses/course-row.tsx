'use client';

import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";

import { CourseType } from "./types";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Badge } from "@/components/ui/shadcn/badge";
import { cn } from "@/lib/utils";

interface CourseRowProps {
  course: CourseType;
  isSelected: boolean;
  onSelect: (courseId: string) => void;
}

export function CourseRow({ 
  course, 
  isSelected,
  onSelect
}: CourseRowProps) {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <tr className={cn(
      "transition-colors",
      isSelected ? "bg-blue-50/40" : "hover:bg-gray-50/60"
    )}>
      <td className="p-4">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onSelect(course.id)}
          className="data-[state=checked]:bg-blue-600"
        />
      </td>
      <td className="p-4">
        <div className="font-medium text-gray-900">{course.title}</div>
      </td>
      <td className="p-4 text-gray-600">{course.category}</td>
      <td className="p-4">
        <Badge variant="outline" className={getLevelColor(course.level)}>
          {course.level}
        </Badge>
      </td>
      <td className="p-4">
        {course.published ? (
          <span className="inline-flex items-center">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="ml-1.5 text-xs text-gray-600">Published</span>
          </span>
        ) : (
          <span className="inline-flex items-center">
            <X className="h-4 w-4 text-amber-500" />
            <span className="ml-1.5 text-xs text-gray-600">Draft</span>
          </span>
        )}
      </td>
      <td className="p-4 text-gray-600">{course.students.toLocaleString()}</td>
      <td className="p-4">
        <div className="flex items-center">
          <span className="text-amber-400 mr-1">★</span>
          <span className="text-gray-600">{course.rating.toFixed(1)}</span>
        </div>
      </td>
      <td className="p-4 font-medium text-gray-900">${course.price.toFixed(2)}</td>
      <td className="p-4 text-gray-500 text-sm">
        {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
      </td>
    </tr>
  );
} 