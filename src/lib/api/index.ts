import { QueryClient } from '@tanstack/react-query';
import { apiService } from './api-service';

/**
 * Create a centralized query client with consistent configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

// Export API service for direct access
export { apiService };

// Export course hooks
export {
  useAllCourses,
  useCourse,
  useCourseBySlug,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useUploadCourseImage,
  courseKeys
} from './course-hooks';

// Export module hooks
export {
  useModulesByCourse,
  useModule,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  moduleKeys,
  useReorderModules
} from './module-hooks';

// Export lesson hooks
export {
  useLessonsByCourse,
  useLesson,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderLessons,
  lessonKeys
} from './lesson-hooks'; 