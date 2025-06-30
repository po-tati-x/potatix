import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { instructorApi } from "../api/instructors";
import type { CourseInstructor, Instructor } from "@/lib/shared/types/courses";

const instructorKeys = {
  list: (courseId: string) => ["course", courseId, "instructors"] as const,
};

export function useCourseInstructors(courseId: string) {
  return useQuery<CourseInstructor[], Error>({
    queryKey: instructorKeys.list(courseId),
    queryFn: () => instructorApi.getCourseInstructors(courseId),
    enabled: !!courseId,
  });
}

export function useAddCourseInstructor(courseId: string) {
  const qc = useQueryClient();
  return useMutation<CourseInstructor, Error, Parameters<typeof instructorApi.addCourseInstructor>[1]>({
    mutationFn: (payload) => instructorApi.addCourseInstructor(courseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorKeys.list(courseId) });
      toast.success("Instructor added");
    },
    onError: (err) => toast.error(err.message || "Failed to add instructor"),
  });
}

export function useUploadInstructorAvatar(instructorId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation<{ avatarUrl: string }, Error, FormData>({
    mutationFn: (fd) => instructorApi.uploadInstructorAvatar(instructorId, fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorKeys.list(courseId) });
      toast.success("Avatar uploaded");
    },
    onError: (err) => toast.error(err.message || "Failed to upload avatar"),
  });
}

export function useUpdateCourseInstructor(courseId: string, instructorId: string) {
  const qc = useQueryClient();
  return useMutation<CourseInstructor[], Error, Parameters<typeof instructorApi.updateCourseInstructor>[2]>({
    mutationFn: (payload) => instructorApi.updateCourseInstructor(courseId, instructorId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorKeys.list(courseId) });
      toast.success("Instructor updated");
    },
    onError: (err) => toast.error(err.message || "Failed to update instructor"),
  });
}

export function useDeleteCourseInstructor(courseId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (instructorId) => instructorApi.deleteCourseInstructor(courseId, instructorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instructorKeys.list(courseId) });
      toast.success('Instructor removed');
    },
    onError: (err) => toast.error(err.message || 'Failed to remove instructor'),
  });
}

// ---------------------------------------------------------------------------
// Public instructor profile (marketing pages)
// ---------------------------------------------------------------------------

export function useInstructor(instructorId: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};
  return useQuery<Instructor, Error>({
    queryKey: ['instructor', instructorId],
    queryFn: () => instructorApi.getInstructor(instructorId),
    enabled: !!instructorId && enabled,
  });
} 