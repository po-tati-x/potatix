import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Course } from "@/lib/shared/types/courses";

import CourseDetailClient from "@/components/features/courses/detail/course-detail-client";
import { CourseDetailProvider } from "@/components/providers/courses/course-detail-context";
import { auth } from "@/lib/auth/auth-server";
import { courseService } from "@/lib/server/services/courses";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const headerList = await headers();
  const session = await auth.api.getSession({ headers: new Headers(Object.fromEntries(headerList)) });
  if (!session || !session.user) {
    redirect("/login");
  }

  const rawCourse = await courseService.getCourseBySlug(slug, false);

  const course: Course | null = rawCourse
    ? ({ ...rawCourse, imageUrl: rawCourse.imageUrl ?? undefined } as unknown as Course)
    : null;

  if (!course || course.userId !== session.user.id) {
    redirect("/courses");
  }

  return (
    <CourseDetailProvider courseId={course.id} initialData={course}>
      <CourseDetailClient />
    </CourseDetailProvider>
  );
}
