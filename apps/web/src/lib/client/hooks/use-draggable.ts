import { useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { UIModule, UILesson } from '@/lib/shared/types/ui';

/**
 * Type for item reordering functions
 */
type ReorderFunction<T> = (items: T[], sourceIndex: number, destIndex: number) => T[];

/**
 * Callback when items are reordered
 */
type ReorderCallback<T> = (items: T[]) => void;

/**
 * Options for the useDraggable hook
 */
interface UseDraggableOptions<T> {
  // The function to call when items are reordered
  onReorder?: ReorderCallback<T>;
  // Optional custom reordering logic
  reorderFn?: ReorderFunction<T>;
}

/**
 * A reusable hook for drag-and-drop functionality
 * 
 * @param items The list of items to make draggable
 * @param options Configuration options
 * @returns An object with drag-and-drop handlers
 */
export function useDraggable<T extends { id: string }>(
  items: T[],
  options?: UseDraggableOptions<T>
) {
  // Default reorder function that moves an item from sourceIndex to destIndex
  const defaultReorderFn: ReorderFunction<T> = useCallback((list, sourceIndex, destIndex) => {
    const reorderedItems = Array.from(list);
    const [removed] = reorderedItems.splice(sourceIndex, 1);
    if (!removed) return reorderedItems;
    reorderedItems.splice(destIndex, 0, removed);
    return reorderedItems;
  }, []);

  // Use the provided reorder function or the default one
  const reorderFn = options?.reorderFn || defaultReorderFn;
  
  // Handle the end of a drag operation
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;
    
    const reorderedItems = reorderFn(items, sourceIndex, destIndex);
    
    // Notify parent component about the reordering
    if (options?.onReorder) {
      options.onReorder(reorderedItems);
    }
    
    return reorderedItems;
  }, [items, options, reorderFn]);

  // Get just the IDs from the items
  const getOrderedIds = useCallback(() => {
    return items.map(item => item.id);
  }, [items]);

  return {
    handleDragEnd,
    getOrderedIds,
  };
}

/**
 * Specialized hook for module drag-and-drop
 */
export function useDraggableModules(
  modules: UIModule[],
  onReorder?: ReorderCallback<UIModule>
) {
  return useDraggable<UIModule>(modules, { onReorder });
}

/**
 * Specialized hook for lesson drag-and-drop
 */
export function useDraggableLessons(
  lessons: UILesson[],
  onReorder?: ReorderCallback<UILesson>
) {
  return useDraggable<UILesson>(lessons, { onReorder });
} 