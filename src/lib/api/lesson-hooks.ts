import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from './api-service';
import type { Lesson, CreateLessonData } from '../types/api';
import { courseKeys } from './course-hooks';

// Query key constants
const LESSON_KEY = 'lessons';
export const lessonKeys = {
  all: (courseId: string) => [...courseKeys.detail(courseId), LESSON_KEY],
  detail: (courseId: string, lessonId: string) => [...courseKeys.detail(courseId), LESSON_KEY, lessonId]
};

// Get lessons by course
export function useLessonsByCourse(courseId: string) {
  return useQuery({
    queryKey: lessonKeys.all(courseId),
    queryFn: () => apiService.lessons.getAll(courseId),
    enabled: !!courseId
  });
}

// Get a lesson by ID
export function useLesson(courseId: string, lessonId: string) {
  return useQuery({
    queryKey: lessonKeys.detail(courseId, lessonId),
    queryFn: () => apiService.lessons.getById({ courseId, lessonId }),
    enabled: !!courseId && !!lessonId
  });
}

// Create a new lesson
export function useCreateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string, data: CreateLessonData }) => 
      apiService.lessons.create({ courseId, data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    }
  });
}

// Update a lesson
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, lessonId, data }: { courseId: string, lessonId: string, data: Partial<Lesson> }) => 
      apiService.lessons.update({ courseId, lessonId, data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ 
        queryKey: lessonKeys.detail(variables.courseId, variables.lessonId) 
      });
    }
  });
}

// Delete a lesson
export function useDeleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string, lessonId: string }) => 
      apiService.lessons.delete({ courseId, lessonId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    }
  });
}

// Reorder lessons
export function useReorderLessons() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, lessons }: { courseId: string, lessons: { id: string; order: number }[] }) => 
      apiService.lessons.reorder({ courseId, lessons }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    }
  });
} 