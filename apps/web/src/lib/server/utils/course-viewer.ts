import { headers } from "next/headers";
import { courseService } from "../services/courses";
import { enrollmentService } from "../services/enrollments";
import { auth } from "@/lib/auth/auth-server";
import type { Course } from "@/lib/shared/types/courses";
import { env } from "@/env.server";
import { redirect } from "next/navigation";

export interface ViewerAccessResult {
  course: Course | null;
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  /** `true` when the user is enrolled (session may still be null) */
  isEnrolled: boolean;
}

// Central application origin (proto + host + optional port)
const APP_ORIGIN = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://potatix.com";

/**
 * If the request is hitting the root host rather than the per-course subdomain, redirect.
 * Must be called in a Next.js Server Component or Route Handler.
 */
export async function ensureCourseSubdomain(slug: string): Promise<void> {
  const hostHeader = (await headers()).get("host") ?? "";
  if (!hostHeader.startsWith(`${slug}.`)) {
    const url = new URL(APP_ORIGIN);
    const target = `${url.protocol}//${slug}.${url.host}`;
    redirect(target);
  }
}

/**
 * Centralised helper for course viewer pages – fetches the course, session and enrollment in one go.
 *
 * Guarantees:
 * – Always returns a course (null when not found)
 * – `isEnrolled` is `false` when user not logged in or not enrolled
 */
export async function getViewerAccess(courseSlug: string): Promise<ViewerAccessResult> {
  // Capture headers synchronously before any async work (Next.js dynamic API requirement)
  const headerList = await headers();

  // Parallelise course + session fetches
  const [course, session] = await Promise.all([
    courseService.getCourseBySlug(courseSlug, true),
    auth.api.getSession({ headers: headerList as any }),
  ]);

  let isEnrolled = false;
  if (course && session?.user) {
    const enrollment = await enrollmentService.checkEnrollment(session.user.id, course.id);
    isEnrolled = enrollment.enrolled;
  }

  return { course: course as unknown as Course | null, session, isEnrolled };
} 