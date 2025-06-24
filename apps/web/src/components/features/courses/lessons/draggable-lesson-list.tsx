"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import type { DropResult, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { useReorderLessons } from "@/lib/client/hooks/use-courses";

// Consistent UILesson interface
export interface UILesson {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  courseId: string;
  order: number;
  createdAt: string | Date; // Support both string and Date for compatibility
  updatedAt: string | Date; // Support both string and Date for compatibility
  
  // UI state properties
  expanded?: boolean;
  uploading?: boolean;
  fileUrl?: string;
  file?: File;
  
  // Other lesson properties
  videoId?: string;
  uploadStatus?: string;
  duration?: number;
  transcriptData?: {
    chapters: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: number;
    }>;
    textLength: number;
    duration: number;
    processedAt: string;
  };
  
  [key: string]: unknown; // Allow for other properties
}

// Type for the core drag and drop functionality only
interface DraggableLessonListProps {
  courseId: string;
  moduleId: string;
  lessons: UILesson[];
  emptyState: React.ReactNode;
  renderLesson: (
    lesson: UILesson,
    index: number,
    dragHandleProps: DraggableProvidedDragHandleProps | null,
    onToggleExpanded?: (id: string) => void
  ) => React.ReactNode;
  onToggleExpanded?: (id: string) => void;
  onReorder?: (reorderedLessons: UILesson[]) => void;
}

/**
 * Core drag and drop functionality only - no UI specifics
 */
export function DraggableLessonList({
  courseId,
  moduleId,
  lessons,
  emptyState,
  renderLesson,
  onToggleExpanded,
  onReorder
}: DraggableLessonListProps) {
  // Use React Query for lesson reordering
  const { mutate: reorderLessons } = useReorderLessons();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;
    
    const reorderedItems = Array.from(lessons);
    const [removed] = reorderedItems.splice(sourceIndex, 1);
    if (!removed) return;
    reorderedItems.splice(destIndex, 0, removed);

    // If there's a parent component that wants to know about reordering, tell it
    if (onReorder) {
      onReorder(reorderedItems);
    }

    // Get just the IDs for reordering
    const orderedIds = reorderedItems.map(lesson => lesson.id);

    // Make the API call with the format expected by the server
    reorderLessons({
      courseId,
      moduleId,
      orderedIds
    }, {
      onSuccess: (data) => {
        console.log("[DEBUG] Lesson reordering succeeded:", data);
      },
      onError: (error) => {
        console.error("[DEBUG] Lesson reordering failed:", error);
        alert(`Failed to reorder lessons: ${error}`);
      }
    });
  };

  if (lessons.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="lessons">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {lessons.length === 0 ? (
              emptyState
            ) : (
              lessons.map((lesson, index) => (
                <Draggable
                  key={lesson.id}
                  draggableId={lesson.id}
                  index={index}
                >
                  {(provided, snapshot) => {
                    // Cast style to any to avoid TypeScript errors with DraggableStyle
                    const style = provided.draggableProps.style as React.CSSProperties;
                    
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={style}
                        className={`${snapshot.isDragging ? "shadow-sm" : ""}`}
                      >
                        {renderLesson(
                          lesson,
                          index,
                          provided.dragHandleProps,
                          onToggleExpanded
                        )}
                      </div>
                    );
                  }}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

