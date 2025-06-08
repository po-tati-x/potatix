import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from './courses-service';

// Query key constants
const COURSES_KEY = 'courses';
export const courseKeys = {
  all: [COURSES_KEY],
  detail: (id: string) => [COURSES_KEY, id],
  bySlug: (slug: string) => [COURSES_KEY, 'slug', slug]
};

// Get all courses
export function useAllCourses() {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: apiService.courses.getAll
  });
}

// Get a course by ID
export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => apiService.courses.getById(id),
    enabled: !!id
  });
}

// Get course by slug
export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: courseKeys.bySlug(slug),
    queryFn: () => apiService.courses.getBySlug(slug),
    enabled: !!slug
  });
}

// Create a new course
export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.courses.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}

// Update a course
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.courses.update,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
    }
  });
}

// Delete a course
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.courses.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}

// Upload a course image
export function useUploadCourseImage() {
  return useMutation({
    mutationFn: apiService.courses.uploadImage
  });
} 