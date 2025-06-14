import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth-server";
import { courseService } from "@/lib/server/services/courses";
import type { Course } from "@/lib/shared/types/courses";
import CourseDetailClient from "@/components/features/courses/detail/course-detail-client";
import { CourseDetailProvider } from "@/components/providers/courses/course-detail-context";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;

  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session || !session.user) {
    redirect("/login");
  }

  const rawCourse = await courseService.getCourseWithDetails(courseId);

  const course: Course | null = rawCourse
    ? ({ ...rawCourse, imageUrl: rawCourse.imageUrl ?? undefined } as unknown as Course)
    : null;

  if (!course || course.userId !== session.user.id) {
    redirect("/courses");
  }

  return (
    <CourseDetailProvider courseId={courseId} initialData={course}>
      <CourseDetailClient courseId={courseId} />
    </CourseDetailProvider>
  );
}
