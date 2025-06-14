"use client";

import { useParams } from "next/navigation";
import EditCourseClient from "@/components/features/courses/edit/edit-course-client";

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  return <EditCourseClient courseId={courseId} />;
}
