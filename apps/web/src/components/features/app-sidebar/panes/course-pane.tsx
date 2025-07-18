'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Sparkles, Pencil } from 'lucide-react';
import { useUpdateCourse } from '@/lib/client/hooks/use-courses';
import type { Course } from '@/lib/shared/types/courses';
import { toast } from 'sonner';
import { ModuleList } from '../nav/module-list';
import { AddModuleButton } from '../nav/ui';
import { SidebarHeader } from '../chrome/sidebar-header';
import { useCourseOutline } from '@/lib/client/hooks/use-courses';
import { Skeleton } from '@/components/ui/skeleton';
import type { Lesson } from '@/lib/shared/types/courses';
import { PaneShell } from './pane-shell';
import { useIsMutating } from '@tanstack/react-query';

interface CoursePaneProps {
  /**
   * Optional slug passed from parent. Falls back to URL param.
   */
  courseSlug?: string;
}

export function CoursePane({ courseSlug }: CoursePaneProps) {
  // Resolve slug from props or route params
  const params = useParams();
  // Memoise slug so we don't recompute on every render
  const slug = useMemo(() => {
    const candidate = courseSlug?.trim() || params.slug || params.courseId || 'course';
    const value = Array.isArray(candidate) ? candidate[0] : candidate;
    return value ?? 'course';
  }, [courseSlug, params.slug, params.courseId]);

  // Data – lightweight outline
  const {
    data: course,
    isLoading,
    error,
    isFetching,
  } = useCourseOutline(slug, {
    includeUnpublished: true,
  });

  // Check if any reorder mutations are in progress
  const isReordering =
    useIsMutating({
      mutationKey: ['reorder'],
    }) > 0;

  // Transform → UI-friendly (memoized to prevent unnecessary re-renders)
  const modules = useMemo(() => {
    if (!course?.modules) return [];

    return course.modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      lessons: (mod.lessons ?? [])
        .filter((lsn): lsn is Lesson => Boolean(lsn && lsn.id))
        .map(lsn => ({
          id: lsn.id,
          title: lsn.title,
          status: lsn.visibility === 'public' ? ('published' as const) : ('draft' as const),
        })),
    }));
  }, [course?.modules]);

  return (
    <nav
      role="navigation"
      aria-label="Course sidebar"
      className="relative h-full p-3 text-slate-800"
    >
      <PaneShell
        header={
          <>
            <SidebarHeader variant="logo" />
            {course && <CourseHeaderCard course={course} slug={slug} />}
          </>
        }
      >
        <div className="flex flex-col gap-4 pt-4">
          {isLoading && <SidebarSkeleton />}

          {error && (
            <p className="mt-4 rounded bg-red-50 p-2 text-sm text-red-600">
              Failed to load course. Please try again.
            </p>
          )}

          {(isFetching || isReordering) && !isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-slate-600" />
              {isReordering ? 'Reordering...' : 'Updating...'}
            </div>
          )}

          {modules.length > 0 ? (
            <ModuleList modules={modules} courseSlug={slug} courseId={course?.id ?? ''} />
          ) : (
            !isLoading && <EmptyState courseSlug={slug} courseId={course?.id ?? ''} />
          )}
        </div>
      </PaneShell>
    </nav>
  );
}

/* -------------------------------- Internals ---------------------------- */

function SidebarSkeleton() {
  // Show 3 placeholder modules with 2 lessons each
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-6 w-3/4" />
          <div className="ml-6 space-y-1">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ courseSlug, courseId }: { courseSlug: string; courseId: string }) {
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-slate-500">
      <p>This course has no modules yet.</p>
      <AddModuleButton courseSlug={courseSlug} courseId={courseId} />
    </div>
  );
}

function CourseHeaderCard({ course, slug }: { course: Course; slug: string }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(course.title);

  const { mutate: updateCourse, isPending: savingTitle } = useUpdateCourse(course.id);

  // Update local title when course title changes
  useMemo(() => {
    setTitle(course.title);
  }, [course.title]);

  function saveTitle() {
    if (!title.trim() || title.trim() === course.title) {
      setEditing(false);
      setTitle(course.title);
      return;
    }
    updateCourse(
      { title: title.trim() },
      {
        onSuccess: () => {
          toast.success('Course title updated');
          setEditing(false);
        },
        onError: err => {
          toast.error(err.message || 'Failed to update title');
          setTitle(course.title);
          setEditing(false);
        },
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setTitle(course.title);
    }
  }

  const statusLabel = course.status === 'published' ? 'Published' : 'Draft';

  return (
    <div className="relative w-full">
      <Link
        href={`/courses/${slug}/edit`}
        aria-label={`Edit ${course.title}`}
        className="group relative block w-full overflow-hidden rounded-md shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        {/* Cover image */}
        <div className="aspect-video w-full bg-slate-200">
          {course.imageUrl && (
            <Image
              src={course.imageUrl}
              alt={course.title ? `Cover image for ${course.title}` : 'Course cover'}
              fill
              sizes="(max-width: 300px) 100vw, 300px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity group-hover:from-black/70" />

        {/* Click hint */}
        <span className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-800 shadow-sm backdrop-blur-sm">
          <Pencil className="size-3" /> Edit
        </span>

        {/* Text & actions */}
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
          {/* Title */}
          {editing ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleKeyDown}
              aria-label="Course title"
              className="w-full max-w-full truncate rounded bg-white/90 px-2 py-1 text-sm font-medium text-slate-900 shadow focus:outline-none"
            />
          ) : (
            <span
              onDoubleClick={() => setEditing(true)}
              title={course.title}
              className="line-clamp-2 max-w-full break-words text-sm font-semibold text-white"
            >
              {savingTitle ? 'Saving…' : course.title}
            </span>
          )}

          {/* No quick action buttons, cover acts as link */}
        </div>

        {/* Status badge */}
        <span
          className={`absolute left-2 top-2 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white ${course.status === 'published' ? 'bg-emerald-700/90' : 'bg-amber-600/90'}`}
        >
          {course.status === 'published' && <Sparkles className="size-3" />}
          {statusLabel}
        </span>
      </Link>

      {/* Removed hidden file input */}
    </div>
  );
}
