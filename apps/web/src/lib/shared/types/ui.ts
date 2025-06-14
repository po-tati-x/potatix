/**
 * UI-specific type definitions that extend domain models with UI state
 */

import type { CourseModule, Lesson } from './courses';

/**
 * Enhanced Module type with UI-specific properties
 */
export interface UIModule extends CourseModule {
  // UI state properties
  expanded?: boolean;
  lessons?: UILesson[];
  
  // Optional properties for UI operations
  isDragging?: boolean;
}

/**
 * Enhanced Lesson type with UI-specific properties
 */
export interface UILesson extends Lesson {
  // UI state properties
  expanded?: boolean;
  uploading?: boolean;
  fileUrl?: string;
  file?: File;
  
  // Optional properties for UI operations
  isDragging?: boolean;
}

/**
 * Generic drag item interface for drag and drop operations
 */
export interface DragItem<T> {
  type: string;
  id: string;
  index: number;
  data: T;
}

/**
 * Base properties for draggable components
 */
export interface DraggableProps {
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
} 