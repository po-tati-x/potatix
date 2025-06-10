import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// UI type definitions
export interface UILesson {
  id: string;
  title?: string;
  description?: string; 
  moduleId?: string;
  order?: number;
  expanded?: boolean;
  uploading?: boolean;
  file?: File;
  fileUrl?: string;
  videoId?: string;
}

export interface UIModule {
  id: string;
  title?: string;
  description?: string;
  order?: number;
  expanded?: boolean;
  lessons?: UILesson[];
}

// EXTREMELY minimal UI state store
// Everything else should be managed with React Query

/**
 * UI-only state for courses - used for expandable modules/lessons
 * and other UI state that needs to persist between renders
 */
export interface CourseUIState {
  expandedModules: Record<string, boolean>;
  expandedLessons: Record<string, boolean>;
  activeModals: Record<string, boolean>;
  editingModuleId: string | null;
  editingLessonId: string | null;
  moduleEditFields: Record<string, string>;
  lessonEditFields: Record<string, { title?: string, description?: string }>;
}

interface CourseUIStore extends CourseUIState {
  toggleModuleExpanded: (moduleId: string) => void;
  toggleLessonExpanded: (lessonId: string) => void;
  setAllModulesExpanded: (expanded: boolean, moduleIds: string[]) => void;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  setEditingModule: (id: string | null) => void;
  setEditingLesson: (id: string | null) => void;
  setModuleEditField: (moduleId: string, value: string) => void;
  setLessonEditField: (lessonId: string, field: 'title' | 'description', value: string) => void;
  reset: () => void;
}

const initialUIState: CourseUIState = {
  expandedModules: {},
  expandedLessons: {},
  activeModals: {},
  editingModuleId: null,
  editingLessonId: null,
  moduleEditFields: {},
  lessonEditFields: {}
};

/**
 * Simple hook for UI state only
 * 
 * @example
 * const { toggleModuleExpanded, expandedModules } = useUIStore();
 */
export const useUIStore = create<CourseUIStore>()(
  devtools(
    (set) => ({
      ...initialUIState,
      
      toggleModuleExpanded: (moduleId) => set((state) => ({
        expandedModules: {
          ...state.expandedModules,
          [moduleId]: !state.expandedModules[moduleId]
        }
      })),
      
      toggleLessonExpanded: (lessonId) => set((state) => ({
        expandedLessons: {
          ...state.expandedLessons,
          [lessonId]: !state.expandedLessons[lessonId]
        }
      })),
      
      setAllModulesExpanded: (expanded, moduleIds) => set((state) => {
        const updates: Record<string, boolean> = {};
        moduleIds.forEach(id => {
          updates[id] = expanded;
        });
        
        return {
          expandedModules: {
            ...state.expandedModules,
            ...updates
          }
        };
      }),
      
      openModal: (id) => set((state) => ({
        activeModals: {
          ...state.activeModals,
          [id]: true
        }
      })),
      
      closeModal: (id) => set((state) => ({
        activeModals: {
          ...state.activeModals,
          [id]: false
        }
      })),
      
      setEditingModule: (id) => set({
        editingModuleId: id
      }),
      
      setEditingLesson: (id) => set({
        editingLessonId: id
      }),
      
      setModuleEditField: (moduleId, value) => set((state) => ({
        moduleEditFields: {
          ...state.moduleEditFields,
          [moduleId]: value
        }
      })),
      
      setLessonEditField: (lessonId, field, value) => set((state) => ({
        lessonEditFields: {
          ...state.lessonEditFields,
          [lessonId]: {
            ...state.lessonEditFields[lessonId],
            [field]: value
          }
        }
      })),
      
      reset: () => set(initialUIState)
    }),
    { name: 'course-ui-store' }
  )
);
