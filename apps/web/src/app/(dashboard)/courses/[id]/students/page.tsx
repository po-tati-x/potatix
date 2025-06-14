"use client";

import { useParams } from "next/navigation";
import StudentsPageClient from "@/components/features/courses/students/students-page-client";

export default function StudentsPage() {
  const params = useParams<{ id: string }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  return <StudentsPageClient courseId={courseId} />;
}
