"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { useReorderLessons } from "@/lib/api/courses";
import { UILesson } from "@/lib/stores/courses";

// Type for the core drag and drop functionality only
interface DraggableLessonListProps {
  courseId: string;
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
  lessons,
  emptyState,
  renderLesson,
  onToggleExpanded,
  onReorder
}: DraggableLessonListProps) {
  // Use React Query for lesson reordering
  const { mutate: reorderLessons } = useReorderLessons();

  const handleDragEnd = (result: DropResult) => {
    console.log("[DEBUG] Drag ended with result:", result);
    
    if (!result.destination) {
      console.log("[DEBUG] No destination, skipping reorder");
      return;
    }

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) {
      console.log("[DEBUG] Source and destination indices are the same, skipping reorder");
      return;
    }

    console.log(`[DEBUG] Moving lesson from index ${sourceIndex} to index ${destIndex}`);
    
    const reorderedItems = Array.from(lessons);
    const [removed] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destIndex, 0, removed);

    // If there's a parent component that wants to know about reordering, tell it
    if (onReorder) {
      onReorder(reorderedItems);
    }

    // Extract only API lesson properties and update order
    const updatedLessons = reorderedItems.map((lesson, index) => ({
      id: lesson.id,
      order: index,
    }));

    // This is the request payload - make sure it matches the API schema
    const requestPayload = {
      lessons: updatedLessons
    };

    console.log("[DEBUG] Sending reorder request with data:", {
      courseId,
      requestPayload
    });

    // Make direct fetch call to the API endpoint to debug
    fetch(`/api/courses/${courseId}/lessons/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    })
    .then(res => {
      console.log(`[DEBUG] Direct fetch response status: ${res.status}`);
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("[DEBUG] Direct fetch succeeded:", data);
    })
    .catch(err => {
      console.error("[DEBUG] Direct fetch failed:", err);
      alert(`Failed to reorder lessons: ${err.message}`);
    });

    // Also use React Query mutation as before
    reorderLessons({
      courseId,
      lessons: updatedLessons,
    }, {
      onSuccess: (data) => {
        console.log("[DEBUG] React Query mutation succeeded:", data);
      },
      onError: (error) => {
        console.error("[DEBUG] React Query mutation failed:", error);
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

