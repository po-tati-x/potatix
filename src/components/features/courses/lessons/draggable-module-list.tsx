"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { useReorderModules } from "@/lib/api/courses";
import { UIModule } from "@/lib/stores/courses";

// Type for the core drag and drop functionality only
interface DraggableModuleListProps {
  courseId: string;
  modules: UIModule[];
  emptyState: React.ReactNode;
  renderModule: (
    module: UIModule,
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
    
    const reorderedItems = Array.from(modules);
    const [removed] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destIndex, 0, removed);

    // If there's a parent component that wants to know about reordering, tell it
    if (onReorder) {
      onReorder(reorderedItems);
    }

    // Extract only API module properties and update order
    const updatedModules = reorderedItems.map((module, index) => ({
      id: module.id,
      order: index,
    }));

    // Make the API call
    reorderModules({
      courseId,
      modules: updatedModules,
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
              modules.map((module, index) => (
                <Draggable
                  key={module.id}
                  draggableId={module.id}
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
                          module,
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