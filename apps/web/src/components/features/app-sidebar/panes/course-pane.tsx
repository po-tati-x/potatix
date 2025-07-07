'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { NavSection } from '../nav/nav-section';
import { createCourseSidebar } from '../config/course-nav';
import { NewsWidget } from '../utility';
import { SidebarHeader } from '../chrome/sidebar-header';
import { useCourseBySlug } from '@/lib/client/hooks/use-courses';
import { Loader2 } from 'lucide-react';

interface CoursePaneProps {
  // Optionally receive data, else derive from params later
  courseSlug?: string;
}

export function CoursePane({ courseSlug }: CoursePaneProps) {
  // For now, slug from props or URL params
  const params = useParams() as { slug?: string; courseId?: string };
  const slug = useMemo(() => {
    return courseSlug && courseSlug.trim() !== ''
      ? courseSlug
      : (params.slug || params.courseId || 'course');
  }, [courseSlug, params.slug, params.courseId]);

  // Fetch course data by slug
  const { data: course, isLoading } = useCourseBySlug(slug, { includeUnpublished: true });

  const navSections = createCourseSidebar({
    slug,
    title: course?.title,
    modules: (course?.modules ?? []).map((mod) => ({
      id: mod.id,
      title: mod.title,
      lessons: (mod.lessons ?? []).map((lsn) => ({
        id: lsn.id,
        title: lsn.title,
      })),
    })),
  });

  return (
    <div className="scrollbar-hide relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
      <nav role="navigation" className="relative flex grow flex-col p-3 text-slate-800">
        <SidebarHeader variant="logo" />

        <div className="flex flex-col gap-4 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              <span className="ml-2 text-sm">Loading course…</span>
            </div>
          ) : (
            navSections.map((section) => <NavSection key={section.id} section={section} />)
          )}
        </div>

        <div className="mt-auto">
          <NewsWidget />
        </div>
      </nav>
    </div>
  );
} 