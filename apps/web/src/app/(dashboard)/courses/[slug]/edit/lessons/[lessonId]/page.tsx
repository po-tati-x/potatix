import { headers } from "next/headers";
import { redirect } from "next/navigation";

import EditLessonClient from "@/components/features/courses/lessons/edit-lesson-client";
import { auth } from "@/lib/auth/auth-server";
import { courseService } from "@/lib/server/services/courses";
import type { Course, Lesson } from "@/lib/shared/types/courses";

interface Params {
  slug: string;
  lessonId: string;
}

export default async function EditLessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, lessonId } = await params;

  /* ------------------------------------------------------------------ */
  /*  Auth & ownership checks                                           */
  /* ------------------------------------------------------------------ */

  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(Object.fromEntries(headerList)),
  });

  if (!session?.user) redirect("/login");

  // Get course (drafts allowed) by slug
  const course = (await courseService.getCourseBySlug(slug, false)) as Course;
  if (!course || course.userId !== session.user.id) {
    redirect("/courses");
  }

  // Verify requested lesson belongs to the course
  const lesson = course.lessons?.find((l: Lesson) => l.id === lessonId);
  if (!lesson) {
    redirect(`/courses/${slug}/edit`);
  }

  /* ------------------------------------------------------------------ */
  /*  Render client component                                           */
  /* ------------------------------------------------------------------ */

  return (
    <EditLessonClient
      courseId={course.id}
      lessonId={lesson.id}
      initialCourse={course}
    />
  );
} 