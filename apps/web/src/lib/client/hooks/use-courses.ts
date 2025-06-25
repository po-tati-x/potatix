import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { courseApi } from "../api/courses";
import type { Course, CreateCourseData } from "@/lib/shared/types/courses";
import { courseKeys } from "@/lib/shared/constants/query-keys";

/**
 * Hook to get all courses for the current user
 */
interface CoursesQueryOptions {
  initialData?: Course[];
  enabled?: boolean;
}

export function useCourses(options?: CoursesQueryOptions) {
  return useQuery<Course[], Error>({
    queryKey: courseKeys.all(),
    queryFn: courseApi.getAllCourses,
    initialData: options?.initialData,
    enabled: options?.enabled ?? !options?.initialData,
    staleTime: options?.initialData ? 5 * 60 * 1000 : 0,
    refetchOnWindowFocus: !(options?.initialData),
  });
}

/**
 * Hook to get a single course by ID
 */
export function useCourse(courseId: string) {
  return useQuery<Course, Error>({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => courseApi.getCourse(courseId),
    enabled: !!courseId,
  });
}

/**
 * Hook to create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation<Course, Error, CreateCourseData>({
    mutationFn: courseApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all() });
      toast.success("Course created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create course");
    },
  });
}

/**
 * Hook to update a course
 */
export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();
  
  return useMutation<Course, Error, Partial<CreateCourseData>>({
    mutationFn: (data) => courseApi.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.all() });
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update course");
    },
  });
}

/**
 * Hook to delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: courseApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all() });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete course");
    },
  });
}

/**
 * Hook to upload a course image
 */
export function useUploadCourseImage(courseId: string) {
  const queryClient = useQueryClient();
  
  return useMutation<{ imageUrl: string }, Error, FormData>({
    mutationFn: (formData) => courseApi.uploadCourseImage(courseId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      toast.success("Image uploaded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });
}

/**
 * Hook to create a module
 */
interface CreateModulePayload { courseId: string; title: string }
export function useCreateModule() {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, CreateModulePayload>({
    mutationFn: courseApi.createModule,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success("Module created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create module");
    },
  });
}

/**
 * Hook to update a module
 */
interface UpdateModulePayload { moduleId: string; title: string; courseId: string }
export function useUpdateModule() {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, UpdateModulePayload>({
    mutationFn: ({ moduleId, title }) => courseApi.updateModule({ moduleId, title }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success("Module updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update module");
    },
  });
}

/**
 * Hook to delete a module
 */
interface DeleteModulePayload { moduleId: string; courseId: string }
export function useDeleteModule() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, DeleteModulePayload>({
    mutationFn: ({ moduleId }) => courseApi.deleteModule(moduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success("Module deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete module");
    },
  });
}

/**
 * Hook to create a lesson
 */
interface CreateLessonPayload { moduleId: string; title: string; courseId: string }
export function useCreateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, CreateLessonPayload>({
    mutationFn: courseApi.createLesson,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success("Lesson created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create lesson");
    },
  });
}

/**
 * Hook to update a lesson
 */
interface UpdateLessonPayload { lessonId: string; title?: string; description?: string; courseId: string }
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, UpdateLessonPayload>({
    mutationFn: ({ lessonId, title, description }) => courseApi.updateLesson({ lessonId, title, description }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success("Lesson updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update lesson");
    },
  });
}

/**
 * Hook to delete a lesson
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { lessonId: string; courseId: string }>({
    mutationFn: ({ lessonId }) => courseApi.deleteLesson(lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success("Lesson deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete lesson");
    },
  });
}

/**
 * Hook to reorder lessons
 */
export function useReorderLessons() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { courseId: string; moduleId: string; orderedIds: string[] }>({
    mutationFn: courseApi.reorderLessons,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder lessons");
    },
  });
}

/**
 * Hook to reorder modules
 */
export function useReorderModules() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { courseId: string; orderedIds: string[] }>({
    mutationFn: courseApi.reorderModules,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder modules");
    },
  });
}

/**
 * Hook to get a course by slug
 */
export function useCourseBySlug(slug: string) {
  return useQuery<Course, Error>({
    queryKey: courseKeys.bySlug(slug),
    queryFn: () => courseApi.getCourseBySlug(slug),
    enabled: !!slug,
  });
} 