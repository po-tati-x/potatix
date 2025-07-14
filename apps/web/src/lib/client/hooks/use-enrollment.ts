import { useMemo } from "react";
import { useSession } from "@/lib/auth/auth";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to manage enrollment state and actions for a given course slug.
 *
 * Keeps the enrollment fetch & mutate logic in one place so components don\'t repeat themselves.
 */
interface UseEnrollmentResult {
  /** Current enrollment status – undefined when the user isn\'t enrolled */
  enrollmentStatus: "active" | "pending" | "rejected" | undefined;
  /** Convenience flag for `enrollmentStatus === \"active\"` */
  isEnrolled: boolean;
  /** GET request is in-flight */
  isLoading: boolean;
  /** POST /enroll is in-flight */
  isEnrolling: boolean;
  /** Trigger enrollment – resolves when the request finishes. Throws `AUTH_REQUIRED` error string if user isn\'t authenticated. */
  enroll: () => Promise<void>;
}

export function useEnrollment(courseSlug: string): UseEnrollmentResult {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  const queryClient = useQueryClient();

  // Fetch current enrollment status (only when authenticated)
  const {
    data,
    isLoading,
  } = useQuery<{ status: "active" | "pending" | "rejected" | undefined }, Error>({
    queryKey: ["course", courseSlug, "enrollment"],
    queryFn: async () => {
      const res = await axios.get<{
        isEnrolled: boolean;
        enrollment: { status: "active" | "pending" | "rejected" } | undefined;
      }>(`/api/courses/enrollment?slug=${courseSlug}`);

      return res.data.enrollment
        ? { status: res.data.enrollment.status }
        : { status: undefined };
    },
    enabled: isAuthenticated && !!courseSlug,
    staleTime: 30_000,
  });

  // Enroll mutation
  const enrollMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("AUTH_REQUIRED");
      }
      await axios.post("/api/courses/enrollment", { courseSlug });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["course", courseSlug, "enrollment"] });
    },
  });

  const enrollmentStatus = data?.status;
  return useMemo<UseEnrollmentResult>(
    () => ({
      enrollmentStatus,
      isEnrolled: enrollmentStatus === "active",
      isLoading,
      isEnrolling: enrollMutation.isPending,
      enroll: () => enrollMutation.mutateAsync(),
    }),
    [enrollmentStatus, isLoading, enrollMutation],
  );
} 