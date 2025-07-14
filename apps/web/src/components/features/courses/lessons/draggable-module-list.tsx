"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import type { DropResult, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { useReorderModules } from "@/lib/client/hooks/use-courses";
import type { UILesson } from "./draggable-lesson-list";

// Import UIModule interface with complete type definition
export interface UIModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: string | Date; // Support both string and Date for compatibility
  updatedAt: string | Date; // Support both string and Date for compatibility
  expanded?: boolean;
  lessons?: UILesson[]; // Lessons within module
  [key: string]: unknown; // Allow for other properties
}

// Type for the core drag and drop functionality only
interface DraggableModuleListProps {
  courseId: string;
  modules: UIModule[];
  emptyState: React.ReactNode;
  renderModule: (
    mod: UIModule,
    index: number,
    dragHandleProps: DraggableProvidedDragHandleProps | null,
    onToggleExpanded?: (id: string) => void
  ) => React.ReactNode;
  onToggleExpanded?: (id: string) => void;
  onReorder?: (reorderedModules: UIModule[]) => void;
}

/**
 * Core drag and drop functionality for modules - no UI specifics
 */
export function DraggableModuleList({
  courseId,
  modules,
  emptyState,
  renderModule,
  onToggleExpanded,
  onReorder
}: DraggableModuleListProps) {
  // Use React Query for module reordering
  const { mutate: reorderModules } = useReorderModules();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;
    
    const reorderedItems = [...modules];
    const [removed] = reorderedItems.splice(sourceIndex, 1);
    if (!removed) return;
    reorderedItems.splice(destIndex, 0, removed);

    // If there's a parent component that wants to know about reordering, tell it
    if (onReorder) {
      onReorder(reorderedItems);
    }

    // Get just the IDs for reordering
    const orderedIds = reorderedItems.map(mod => mod.id);

    // Make the API call with the format expected by the server
    reorderModules({
      courseId,
      orderedIds
    }, {
      onSuccess: (data) => {
        console.log("[DEBUG] Module reordering succeeded:", data);
      },
      onError: (error) => {
        console.error("[DEBUG] Module reordering failed:", error);
        alert(`Failed to reorder modules: ${error}`);
      }
    });
  };

  if (modules.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="modules">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {modules.length === 0 ? (
              emptyState
            ) : (
              modules.map((mod, index) => (
                <Draggable
                  key={mod.id}
                  draggableId={mod.id}
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
                        className={`${snapshot.isDragging ? "shadow-lg ring-2 ring-slate-200" : ""}`}
                      >
                        {renderModule(
                          mod,
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