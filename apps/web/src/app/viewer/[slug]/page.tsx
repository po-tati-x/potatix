import { notFound } from 'next/navigation';

import { ensureCourseSubdomain, getViewerAccess } from '@/lib/server/utils/course-viewer';
import { CourseHubClient } from '@/components/features/viewer/course-hub/course-hub-client';
import CourseMarketing from '@/components/features/marketing/courses';
import type { Course } from '@/lib/shared/types/courses';

// Server-side component – fetch course once, hand straight to the client UI
export default async function CourseViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Ensure viewer is on correct sub-domain
  await ensureCourseSubdomain(slug);

  const { course, session, isEnrolled } = await getViewerAccess(slug);

  if (!course) {
    notFound();
  }

  if (!session?.user || !isEnrolled) {
    // Show marketing landing if not logged in or not enrolled
    return <CourseMarketing course={course as unknown as Course} isLoggedIn={Boolean(session?.user)} />;
  }

  return <CourseHubClient courseSlug={slug} />;
}
