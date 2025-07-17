import { headers } from "next/headers";
import { courseService } from "../services/courses";
import { enrollmentService } from "../services/enrollments";
import { auth } from "@/lib/auth/auth-server";
import type { Course } from "@/lib/shared/types/courses";
import { env } from "@/env.server";
import { redirect } from "next/navigation";

export interface ViewerAccessResult {
  course: Course | undefined;
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
  const headerList = await headers();
  const hostHeader = headerList.get("host") ?? "";
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

  // Prepare typed promises to preserve useful types and avoid `any` inference
  const coursePromise = courseService.getCourseBySlug(courseSlug, true);
  const sessionPromise = auth.api.getSession({ headers: headerList });

  const [course, session] = await Promise.all([coursePromise, sessionPromise]);

  let isEnrolled = false;
  if (course) {
    const userId = session?.user?.id;
    if (userId) {
      const enrollment = await enrollmentService.checkEnrollment(userId, course.id);
      isEnrolled = enrollment.enrolled;
    }
  }

  return { course: course ?? undefined, session, isEnrolled };
}