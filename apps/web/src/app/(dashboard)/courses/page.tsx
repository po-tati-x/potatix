import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth-server";
import { courseService } from "@/lib/server/services/courses";
import CoursesPageClient from "@/components/features/courses/list/courses-page-client";
import type { Course } from "@/lib/shared/types/courses";

export default async function CoursesPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session || !session.user) {
    redirect("/login");
  }

  const rawData = await courseService.getCoursesByUserId(session.user.id);
  const normalizedData = rawData.map((c) => ({
    ...c,
    imageUrl: c.imageUrl ?? undefined,
  })) as unknown as Course[];

  return <CoursesPageClient initialData={normalizedData} />;
}
