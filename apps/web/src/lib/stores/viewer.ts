import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Course } from '@/lib/types/api';

export type EnrollmentStatus = 'active' | 'pending' | 'rejected' | null;

/**
 * Core viewer state interface
 */
export interface ViewerState {
  // Course data
  currentCourse: Course | null;
  currentCourseSlug: string | null;
  
  // UI state
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  
  // Auth state
  isAuthenticated: boolean;
  authChecked: boolean;
  
  // Enrollment state
  isEnrolled: boolean;
  enrollmentStatus: EnrollmentStatus;
  isEnrollmentLoading: boolean;
  isEnrolling: boolean;
  
  // Progress state
  lessonProgress: Record<string, number>; // lessonId -> progress percentage
  completedLessons: string[]; // array of completed lesson IDs
}

/**
 * Viewer store interface with actions
 */
interface ViewerStore extends ViewerState {
  // Course actions
  setCourse: (course: Course | null) => void;
  setCourseSlug: (slug: string | null) => void;
  
  // UI actions
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  
  // Auth actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAuthChecked: (checked: boolean) => void;
  
  // Enrollment actions
  setEnrolled: (enrolled: boolean) => void;
  setEnrollmentStatus: (status: EnrollmentStatus) => void;
  setEnrollmentLoading: (loading: boolean) => void;
  setEnrolling: (enrolling: boolean) => void;
  
  // Progress actions
  setLessonProgress: (lessonId: string, progress: number) => void;
  markLessonCompleted: (lessonId: string) => void;
  markLessonIncomplete: (lessonId: string) => void;
  
  // Reset actions
  resetViewerState: () => void;
  resetCourseData: () => void;
}

/**
 * Initial state for the viewer
 */
const initialViewerState: ViewerState = {
  // Course data
  currentCourse: null,
  currentCourseSlug: null,
  
  // UI state
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  
  // Auth state
  isAuthenticated: false,
  authChecked: false,
  
  // Enrollment state
  isEnrolled: false,
  enrollmentStatus: null,
  isEnrollmentLoading: false,
  isEnrolling: false,
  
  // Progress state
  lessonProgress: {},
  completedLessons: [],
};

/**
 * Viewer store with Zustand
 * Handles all viewer state including sidebar, auth, enrollment, and progress
 * 
 * @example
 * const { isSidebarCollapsed, toggleSidebarCollapsed } = useViewerStore();
 */
export const useViewerStore = create<ViewerStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialViewerState,
        
        // Course actions
        setCourse: (course) => set({ currentCourse: course }),
        setCourseSlug: (slug) => set({ currentCourseSlug: slug }),
        
        // UI actions
        toggleSidebarCollapsed: () => set((state) => ({ 
          isSidebarCollapsed: !state.isSidebarCollapsed 
        })),
        
        setSidebarCollapsed: (collapsed) => set({ 
          isSidebarCollapsed: collapsed 
        }),
        
        toggleMobileSidebar: () => set((state) => ({ 
          isMobileSidebarOpen: !state.isMobileSidebarOpen 
        })),
        
        setMobileSidebarOpen: (open) => set({ 
          isMobileSidebarOpen: open 
        }),
        
        // Auth actions
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setAuthChecked: (checked) => set({ authChecked: checked }),
        
        // Enrollment actions
        setEnrolled: (enrolled) => set({ isEnrolled: enrolled }),
        
        setEnrollmentStatus: (status) => set({ 
          enrollmentStatus: status,
          isEnrolled: status === 'active'
        }),
        
        setEnrollmentLoading: (loading) => set({ 
          isEnrollmentLoading: loading 
        }),
        
        setEnrolling: (enrolling) => set({ isEnrolling: enrolling }),
        
        // Progress actions
        setLessonProgress: (lessonId, progress) => set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: progress
          }
        })),
        
        markLessonCompleted: (lessonId) => set((state) => ({
          completedLessons: state.completedLessons.includes(lessonId)
            ? state.completedLessons
            : [...state.completedLessons, lessonId],
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: 100
          }
        })),
        
        markLessonIncomplete: (lessonId) => set((state) => ({
          completedLessons: state.completedLessons.filter(id => id !== lessonId)
        })),
        
        // Reset actions
        resetViewerState: () => set(initialViewerState),
        
        resetCourseData: () => set({
          currentCourse: null,
          currentCourseSlug: null,
          isEnrolled: false,
          enrollmentStatus: null,
          lessonProgress: {},
          completedLessons: []
        })
      }),
      {
        name: 'viewer-storage',
        partialize: (state) => ({
          // Only persist these fields
          isSidebarCollapsed: state.isSidebarCollapsed,
          completedLessons: state.completedLessons,
          lessonProgress: state.lessonProgress
        })
      }
    ),
    { name: 'viewer-store' }
  )
);

/**
 * Hook to get the current lesson's progress
 * @param lessonId - The ID of the lesson
 * @returns The progress percentage (0-100) or undefined if not started
 * 
 * @example
 * const progress = useCurrentLessonProgress('lesson-123');
 * if (progress === 100) {
 *   // Lesson completed
 * }
 */
export function useCurrentLessonProgress(lessonId: string | undefined): number | undefined {
  return useViewerStore(
    (state) => lessonId ? state.lessonProgress[lessonId] : undefined
  );
}

/**
 * Hook to check if a lesson is completed
 * @param lessonId - The ID of the lesson
 * @returns True if the lesson is completed
 * 
 * @example
 * const isCompleted = useLessonCompleted('lesson-123');
 */
export function useLessonCompleted(lessonId: string | undefined): boolean {
  return useViewerStore(
    (state) => lessonId ? state.completedLessons.includes(lessonId) : false
  );
}

/**
 * Hook to get the course completion percentage
 * @returns The percentage of lessons completed (0-100)
 * 
 * @example
 * const courseProgress = useCourseProgress();
 */
export function useCourseProgress(): number {
  return useViewerStore((state) => {
    if (!state.currentCourse?.lessons?.length) return 0;
    
    const totalLessons = state.currentCourse.lessons.length;
    const completedCount = state.completedLessons.length;
    
    return Math.round((completedCount / totalLessons) * 100);
  });
}
