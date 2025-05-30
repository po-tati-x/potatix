import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Course, coursesApi } from '../utils/api-client';

interface CourseDetailState {
  // Data
  course: Course | null;
  courseId: string | null;
  expandedLessons: Record<string, boolean>;
  
  // UI states
  loading: boolean;
  error: string | null;




  
  
  // Actions
  fetchCourse: (id: string) => Promise<void>;
  toggleLesson: (lessonId: string) => void;
  moveLesson: (index: number, direction: 'up' | 'down') => Promise<void>;
  deleteCourse: () => Promise<boolean>;
  reset: () => void;
}

export const useCourseDetailStore = create<CourseDetailState>()(
  devtools(
    (set, get) => ({
      // Initial state
      course: null,
      courseId: null,
      expandedLessons: {},
      loading: true,
      error: null,
      
      // Actions
      fetchCourse: async (id: string) => {
        if (!id) {
          set({ error: 'Invalid course ID', loading: false });
          return;
        }
        
        set({ loading: true, error: null, courseId: id });
        
        try {
          const data = await coursesApi.getById(id);
          set({ course: data, loading: false });
        } catch (err) {
          console.error('Failed to fetch course:', err);
          set({ 
            error: err instanceof Error ? err.message : 'Course not found or you don\'t have access to it',
            loading: false
          });
        }
      },
      
      toggleLesson: (lessonId: string) => {
        set((state) => ({
          expandedLessons: {
            ...state.expandedLessons,
            [lessonId]: !state.expandedLessons[lessonId]
          }
        }));
      },
      
      moveLesson: async (index: number, direction: 'up' | 'down') => {
        const { course, courseId } = get();
        
        if (!course || !course.lessons || !courseId) {
          console.error('Cannot move lesson: course or lessons not available');
          return;
        }
        
        // Don't move if already at the edge
        if (
          (direction === 'up' && index === 0) ||
          (direction === 'down' && index === course.lessons.length - 1)
        ) {
          return;
        }
        
        // Calculate new index
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        // First update the local state for immediate UI feedback
        const newLessons = [...course.lessons];
        const [movedLesson] = newLessons.splice(index, 1);
        newLessons.splice(newIndex, 0, movedLesson);
        
        // Update the 'order' property on the affected lessons
        newLessons.forEach((lesson, idx) => {
          lesson.order = idx;
        });
        
        // Update local state
        set({ 
          course: { 
            ...course, 
            lessons: newLessons 
          } 
        });
        
        // Prepare data for API call
        const orderedLessons = newLessons.map(lesson => ({
          id: lesson.id,
          order: lesson.order
        }));
        
        try {
          // Save to database
          await coursesApi.lessons.reorderLessons(courseId, orderedLessons);
        } catch (error) {
          console.error('Failed to persist lesson order:', error);
          // If the API call fails, we could fetch the course again to reset to server state
          await get().fetchCourse(courseId);
        }
      },
      
      deleteCourse: async () => {
        const { courseId } = get();
        
        if (!courseId) return false;
        
        try {
          await coursesApi.delete(courseId);
          return true;
        } catch (err) {
          console.error('Failed to delete course:', err);
          return false;
        }
      },
      
      // Reset store state
      reset: () => set({
        course: null,
        courseId: null,
        expandedLessons: {},
        loading: true,
        error: null
      })
    }),
    { name: 'course-detail-store' }
  )
); 