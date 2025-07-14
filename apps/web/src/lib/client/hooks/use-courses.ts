import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { courseApi } from '../api/courses';
import type { Course, CreateCourseData } from '@/lib/shared/types/courses';
import { courseKeys } from '@/lib/shared/constants/query-keys';

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
    queryFn: () => courseApi.getAllCourses(),
    initialData: options?.initialData,
    enabled: options?.enabled ?? !options?.initialData,
    staleTime: options?.initialData ? 5 * 60 * 1000 : 0,
    refetchOnWindowFocus: !options?.initialData,
  });
}

/**
 * Hook to get a single course by ID
 */
export function useCourse(courseId: string, options?: { initialData?: Course; enabled?: boolean }) {
  const hasInitial = options?.initialData !== undefined;

  return useQuery<Course, Error>({
    queryKey: courseKeys.detail(courseId),
    // Skip network call when we already have initial data
    queryFn: () => courseApi.getCourse(courseId),
    enabled: options?.enabled ?? (!!courseId && !hasInitial),
    initialData: options?.initialData,
    // Keep fresh for a while when initial data provided
    staleTime: hasInitial ? 5 * 60 * 1000 : 0,
  });
}

/**
 * Hook to create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, CreateCourseData>({
    mutationFn: (data) => courseApi.createCourse(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all() });
      toast.success('Course created successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to create course');
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
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      void queryClient.invalidateQueries({ queryKey: courseKeys.all() });
      toast.success('Course updated successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update course');
    },
  });
}

/**
 * Hook to delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => courseApi.deleteCourse(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all() });
      toast.success('Course deleted successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete course');
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
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      toast.success('Image uploaded successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
}

/**
 * Hook to create a module
 */
interface CreateModulePayload {
  courseId: string;
  title: string;
}
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CreateModulePayload>({
    mutationFn: (payload) => courseApi.createModule(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      void queryClient.invalidateQueries({ queryKey: ['course', 'outline'] });
      toast.success('Module created successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to create module');
    },
  });
}

/**
 * Hook to update a module
 */
interface UpdateModulePayload {
  moduleId: string;
  title: string;
  courseId: string;
}
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateModulePayload>({
    mutationFn: ({ moduleId, title }) => courseApi.updateModule({ moduleId, title }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success('Module updated successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update module');
    },
  });
}

/**
 * Hook to delete a module
 */
interface DeleteModulePayload {
  moduleId: string;
  courseId: string;
}
export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteModulePayload>({
    mutationFn: ({ moduleId }) => courseApi.deleteModule(moduleId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success('Module deleted successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete module');
    },
  });
}

/**
 * Hook to create a lesson
 */
interface CreateLessonPayload {
  moduleId: string;
  title: string;
  courseId: string;
}
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, CreateLessonPayload>({
    mutationFn: (payload) => courseApi.createLesson(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      // also refresh lightweight outline used by sidebar
      void queryClient.invalidateQueries({ queryKey: ['course', 'outline'] });
      toast.success('Lesson created successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to create lesson');
    },
  });
}

/**
 * Hook to update a lesson
 */
interface UpdateLessonPayload {
  lessonId: string;
  title?: string;
  description?: string;
  visibility?: 'public' | 'enrolled';
  playbackId?: string | undefined;
  uploadStatus?: string | undefined;
  transcriptData?: unknown;
  courseId: string;
}
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateLessonPayload>({
    mutationFn: ({
      lessonId,
      title,
      description,
      visibility,
      playbackId,
      uploadStatus,
      transcriptData,
    }) =>
      courseApi.updateLesson({
        lessonId,
        title,
        description,
        visibility,
        playbackId,
        uploadStatus,
        transcriptData,
      }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success('Lesson updated successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update lesson');
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
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      toast.success('Lesson deleted successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete lesson');
    },
  });
}

/**
 * Hook to reorder lessons
 */
export function useReorderLessons() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { courseId: string; moduleId: string; orderedIds: string[] }>({
    mutationKey: ['reorder', 'lessons'],
    mutationFn: (payload) => courseApi.reorderLessons(payload),
    onSuccess: (_, variables) => {
      // Sync cache with server after successful reorder
      void queryClient.invalidateQueries({ queryKey: ['course', 'outline'] });
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
    onError: error => {
      toast.error(error.message || 'Failed to reorder lessons');
    },
  });
}

/**
 * Hook to reorder modules
 */
export function useReorderModules() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { courseId: string; orderedIds: string[] }>({
    mutationKey: ['reorder', 'modules'],
    mutationFn: (payload) => courseApi.reorderModules(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
    onError: error => {
      toast.error(error.message || 'Failed to reorder modules');
    },
  });
}

/**
 * Hook to get a course by slug
 */
export function useCourseBySlug(slug: string, options?: { includeUnpublished?: boolean }) {
  const includeUnpublished = options?.includeUnpublished ?? false;
  return useQuery<Course, Error>({
    queryKey: courseKeys.bySlug(slug),
    queryFn: () => courseApi.getCourseBySlug(slug, includeUnpublished),
    enabled: !!slug,
  });
}

/**
 * Hook to get lightweight course outline for sidebar
 */
export function useCourseOutline(slug: string, options?: { includeUnpublished?: boolean }) {
  const includeUnpublished = options?.includeUnpublished ?? false;
  return useQuery<Course, Error>({
    queryKey: ['course', 'outline', slug, includeUnpublished],
    queryFn: () => courseApi.getCourseOutlineBySlug(slug, includeUnpublished),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch single lesson details
 */
export function useLesson(courseId: string, lessonId: string) {
  return useQuery<unknown, Error>({
    queryKey: ['course', 'lesson', courseId, lessonId],
    queryFn: () => courseApi.getLesson(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });
}

/**
 * Hook to reorder lessons across modules.
 */
export function useReorderLessonsAcrossModules() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { courseId: string; modules: { moduleId: string; lessonIds: string[] }[] }
  >({
    mutationKey: ['reorder', 'lessons', 'cross-module'],
    mutationFn: (payload) => courseApi.reorderLessonsAcrossModules(payload),
    onSuccess: (_, variables) => {
      // Sync cache with server after successful reorder
      void queryClient.invalidateQueries({ queryKey: ['course', 'outline'] });
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
    onError: error => {
      toast.error(error.message || 'Failed to reorder lessons');
    },
  });
}
