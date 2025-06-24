"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "@/lib/client/api/courses";
import type { Course } from "@/lib/client/api/courses";
import { courseKeys } from "@/lib/shared/constants/query-keys";
import { formatMonthDay } from "@/lib/shared/utils/format";

interface CourseDetailContextValue {
  course: Course | null;
  isLoading: boolean;
  error: Error | null;
  deleteCourse: () => Promise<void>;
  isDeleting: boolean;
  expandedModules: Record<string, boolean>;
  toggleModuleExpanded: (moduleId: string) => void;
  formatDate: (iso: string) => string;
}

const CourseDetailContext = createContext<CourseDetailContextValue | undefined>(
  undefined,
);

interface ProviderProps {
  children: ReactNode;
  courseId: string;
  initialData?: Course;
}

export function CourseDetailProvider({ children, courseId, initialData }: ProviderProps) {
  const queryClient = useQueryClient();

  // Fetch course data
  const {
    data: course,
    isLoading,
    error,
  } = useQuery<Course, Error>({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => courseApi.getCourse(courseId),
    initialData,
    enabled: initialData ? false : true,
  });

  // Delete mutation
  const deleteMutation = useMutation<void, Error, void>({
    mutationFn: () => courseApi.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all() });
    },
  });

  // Expanded modules state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const toggleModuleExpanded = useCallback((moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }, []);

  const value: CourseDetailContextValue = useMemo(
    () => ({
      course: course ?? null,
      isLoading,
      error: error || null,
      deleteCourse: async () => deleteMutation.mutateAsync(),
      isDeleting: deleteMutation.isPending,
      expandedModules,
      toggleModuleExpanded,
      formatDate: (iso) => formatMonthDay(iso),
    }),
    [course, isLoading, error, deleteMutation, expandedModules, toggleModuleExpanded],
  );

  return (
    <CourseDetailContext.Provider value={value}>
      {children}
    </CourseDetailContext.Provider>
  );
}

export function useCourseDetail() {
  const ctx = useContext(CourseDetailContext);
  if (!ctx) throw new Error("useCourseDetail must be used within CourseDetailProvider");
  return ctx;
} 