import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Course, coursesApi } from '../utils/api-client';

interface CoursesListState {
  // Data
  courses: Course[];
  
  // UI states
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCourses: () => Promise<void>;
  reset: () => void;
}

export const useCoursesListStore = create<CoursesListState>()(
  devtools(
    (set) => ({
      // Initial state
      courses: [],
      loading: false,
      error: null,
      
      // Actions
      fetchCourses: async () => {
        set({ loading: true, error: null });
        
        try {
          const coursesData = await coursesApi.getAll();
          set({ courses: coursesData, loading: false });
        } catch (err) {
          console.error('Failed to fetch courses:', err);
          set({ 
            error: err instanceof Error ? err.message : 'Failed to load courses',
            loading: false
          });
        }
      },
      
      // Reset store state
      reset: () => set({
        courses: [],
        loading: false,
        error: null
      })
    }),
    { name: 'courses-list-store' }
  )
); 