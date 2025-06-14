import { courseService } from "@/lib/server/services/courses";
import CourseOverview from "@/components/features/viewer/course-overview";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Course } from "@/lib/shared/types/courses";

// Central application origin (proto + host + optional port)
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://potatix.ocom";

// Server-side component – fetch course once, hand straight to the client UI
export default async function CourseViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // If the request is hitting the root host, bounce to the sub-domain that owns the course
  const hostHeader = (await headers()).get("host") ?? "";
  if (!hostHeader.startsWith(`${slug}.`)) {
    const url = new URL(APP_ORIGIN);
    const target = `${url.protocol}//${slug}.${url.host}`;
    redirect(target);
  }

  const courseRaw = await courseService.getCourseBySlug(slug, true);

  if (!courseRaw) {
    notFound();
  }

  const course = courseRaw as unknown as Course;

  const lessons = course.lessons ?? [];
  const totalLessonsCount = lessons.length;
  const unlockedLessonsCount = lessons.filter((l) => l.videoId).length;

  return (
    <CourseOverview
      course={course}
      unlockedLessonsCount={unlockedLessonsCount}
      totalLessonsCount={totalLessonsCount}
      courseSlug={slug}
      enrollmentStatus={null}
    />
  );
}