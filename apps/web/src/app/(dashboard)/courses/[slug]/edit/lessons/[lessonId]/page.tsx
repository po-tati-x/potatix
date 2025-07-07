import { headers } from "next/headers";
import { redirect } from "next/navigation";

import EditLessonClient from "@/components/features/courses/lessons/edit-lesson-client";
import { auth } from "@/lib/auth/auth-server";
import { courseService } from "@/lib/server/services/courses";
import { lessonService } from "@/lib/server/services/lessons";

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
  const course = await courseService.getCourseBySlug(slug, false);
  if (!course || course.userId !== session.user.id) {
    redirect("/courses");
  }

  // Get lesson & verify it belongs to the course
  const lesson = await lessonService.getLessonById(lessonId);
  if (!lesson || lesson.courseId !== course.id) {
    redirect(`/courses/${slug}/edit`);
  }

  /* ------------------------------------------------------------------ */
  /*  Render client component                                           */
  /* ------------------------------------------------------------------ */

  return <EditLessonClient courseId={course.id} lessonId={lesson.id} />;
} 