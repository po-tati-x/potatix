'use client';

import { CourseHub } from './course-hub';
import { CourseHubProvider } from './course-hub-provider';

export interface CourseHubClientProps {
  courseSlug: string;
}

export function CourseHubClient({ courseSlug }: CourseHubClientProps) {
  return (
    <CourseHubProvider courseSlug={courseSlug}>
      <CourseHub />
    </CourseHubProvider>
  );
}
