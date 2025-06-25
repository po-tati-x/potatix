import { headers } from "next/headers";
import { redirect } from "next/navigation";

import EditCourseClient from "@/components/features/courses/edit/edit-course-client";
import { auth } from "@/lib/auth/auth-server";
import { courseService } from "@/lib/server/services/courses";

interface Params {
  slug: string;
}

export default async function EditCoursePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const headerList = await headers();
  const session = await auth.api.getSession({ headers: new Headers(Object.fromEntries(headerList)) });
  if (!session?.user) redirect("/login");

  const course = await courseService.getCourseBySlug(slug, false);
  if (!course || course.userId !== session.user.id) {
    redirect("/courses");
  }

  return <EditCourseClient courseId={course.id} />;
}
