import type { NavSection } from './static-nav';

interface LessonLike {
  id: string;
  title: string;
}

interface ModuleLike {
  id: string;
  title: string;
  lessons: LessonLike[];
}

interface CourseLike {
  slug: string;
  /** Human-readable title, optional but preferred. */
  title?: string;
  modules: ModuleLike[];
}

export function createCourseSidebar(course: CourseLike): NavSection[] {
  return [
    {
      id: 'course-modules',
      items: [
        {
          name: course.title ?? course.slug,
          href: `/courses/${course.slug}/edit`,
          exact: true,
          variant: 'course' as const,
        },
        ...course.modules.map((mod) => ({
          // Show lesson count for quick-glance UX
          name: `${mod.title || 'Untitled Module'} (${mod.lessons.length})`,
          href: `/courses/${course.slug}/edit?module=${mod.id}`,
          variant: 'module' as const,
          items: mod.lessons.map((lsn) => ({
            name: lsn.title || 'Untitled Lesson',
            href: `/courses/${course.slug}/edit/lessons/${lsn.id}`,
            exact: true,
            variant: 'lesson' as const,
          })),
        })),
      ],
    },
  ];
} 