import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { enrollmentApi } from "../api/enrollments";
import type { Enrollment } from "../api/enrollments";
import { courseKeys } from "@/lib/shared/constants/query-keys";

export function useStudents(courseId: string): UseQueryResult<Enrollment[], Error> {
  return useQuery<Enrollment[], Error>({
    queryKey: [...courseKeys.detail(courseId), "students"],
    queryFn: () => enrollmentApi.getStudents(courseId),
    enabled: !!courseId,
  });
}

export function useUpdateEnrollment(courseId: string): UseMutationResult<void, Error, { enrollmentId: string; status: Enrollment["status"] }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, status }) => enrollmentApi.updateEnrollment(enrollmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...courseKeys.detail(courseId), "students"] });
    },
  });
} 