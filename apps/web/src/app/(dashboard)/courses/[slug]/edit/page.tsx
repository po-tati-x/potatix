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

  // Capture request headers for auth – Next requires sync extraction before async work
  const headerList = await headers();

  // Narrow session shape locally to avoid `any`
  const session = (await auth.api.getSession({
    headers: new Headers(Object.fromEntries(headerList)),
  })) as { user?: { id: string } } | undefined;

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch course including drafts (owner editing), then cast to shared Course type
  const course = await courseService.getCourseBySlug(slug, false);

  if (!course || course.userId !== session.user.id) {
    redirect("/courses");
  }

  return <EditCourseClient courseId={course.id} />;
}
