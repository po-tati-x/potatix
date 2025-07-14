import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GripVertical, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/new-button';
import Modal from '@/components/ui/modal';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import {
  draggable,
  dropTargetForElements,
  type ElementDropTargetEventBasePayload,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge as untypedAttachClosestEdge,
  extractClosestEdge as untypedExtractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

// Atlaskit utils ship without type info. Wrap them once with explicit typing to
// silence `no-unsafe-*` ESLint rules.
const extractClosestEdge = untypedExtractClosestEdge as unknown as (
  data: unknown,
) => ClosestEdge | undefined;

const attachClosestEdge = untypedAttachClosestEdge as unknown as (
  data: { lessonId: string; index: number; moduleId: string; instanceId: symbol },
  opts: { element: HTMLElement; input: unknown; allowedEdges: ClosestEdge[] },
) => Record<string | symbol, unknown>;
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

import { useDragCtx } from './drag-context';
import type { Lesson } from './types';
import { useDeleteLesson } from '@/lib/client/hooks/use-courses';

type ClosestEdge = 'top' | 'bottom';

interface LessonRowProps {
  lesson: Lesson;
  index: number;
  moduleId: string;
  courseSlug: string;
  courseId: string;
}

function LessonRowComponent({ lesson, index, moduleId, courseSlug, courseId }: LessonRowProps) {
  const pathname = usePathname();
  const isActive = pathname?.includes(`/lessons/${lesson.id}`);
  const { instanceId, registerItem, reorderItem } = useDragCtx();

  const containerRef = useRef<HTMLLIElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  // Undefined indicates no drop indicator needed.
  const [closestEdge, setClosestEdge] = useState<ClosestEdge | undefined>();

  const { mutate: deleteLesson, isPending: deleting } = useDeleteLesson();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = useCallback(() => {
    deleteLesson(
      { lessonId: lesson.id, courseId },
      {
        onSuccess: () => setShowDeleteModal(false),
      },
    );
  }, [deleteLesson, lesson.id, courseId]);

  const handleDeleteLesson = useCallback(() => {
    if (deleting) return;
    setShowDeleteModal(true);
  }, [deleting]);

  const handleChange = useCallback(({ source, self }: ElementDropTargetEventBasePayload) => {
    const handle = handleRef.current;
    if (!handle) return;

    const isSource = source.element === handle;
    if (isSource) {
      setClosestEdge(undefined);
      return;
    }
    const edge = extractClosestEdge(self.data);
    setClosestEdge(edge);
  }, []);

  const handleDragLeave = useCallback(() => {
    setClosestEdge(undefined);
  }, []);

  const handleDrop = useCallback(
    (payload: ElementDropTargetEventBasePayload) => {
      setClosestEdge(undefined);
      const { source, self } = payload as ElementDropTargetEventBasePayload & {
        source: { data: { lessonId: string; moduleId: string; index: number; instanceId: symbol } };
        self: { data: unknown };
      };
      const closestEdgeOfTarget = extractClosestEdge(self.data);
      const src = source.data as { lessonId: string; moduleId: string; index: number };
      reorderItem({
        sourceModuleId: src.moduleId,
        startIndex: src.index,
        targetModuleId: moduleId,
        indexOfTarget: index,
        closestEdgeOfTarget: closestEdgeOfTarget,
      });
    },
    [reorderItem, moduleId, index],
  );

  useEffect(() => {
    const element = containerRef.current;
    const handle = handleRef.current;
    if (!element || !handle) return;

    const cleanup: Array<() => void> = [
      // Register list item for shared drag context
      registerItem({ lessonId: lesson.id, element }),
      // Enable drag on the handle
      draggable({
        element: handle,
        getInitialData: () => ({ lessonId: lesson.id, moduleId, index, instanceId }),
        onGenerateDragPreview({ location, nativeSetDragImage, source }) {
          const rowElement = containerRef.current?.querySelector('div') as HTMLElement | undefined;
          const previewSource = rowElement || containerRef.current || source.element;
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: previewSource,
              input: location.current.input,
            }),
            render({ container }) {
              const clone = previewSource.cloneNode(true) as HTMLElement;
              clone.style.margin = '0';
              clone.style.boxSizing = 'border-box';
              clone.style.width = `${previewSource.offsetWidth}px`;
              clone.style.pointerEvents = 'none';
              clone.classList.add('bg-white', 'shadow-lg', 'rounded');
              container.append(clone);
              return () => {
                clone.remove();
              };
            },
          });
        },
      }) as () => void,
      // Make the entire row a drop target
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return source.data.instanceId === instanceId;
        },
        getData({ input }) {
          return attachClosestEdge(
            { lessonId: lesson.id, index, moduleId, instanceId },
            {
              element,
              input,
              allowedEdges: ['top', 'bottom'],
            },
          );
        },
        onDragEnter: handleChange,
        onDrag: handleChange,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }) as () => void,
    ];

    return () => {
      for (const fn of cleanup) fn();
    };
  }, [
    instanceId,
    lesson.id,
    moduleId,
    index,
    registerItem,
    handleChange,
    handleDragLeave,
    handleDrop,
  ]);

  return (
    <li ref={containerRef} data-lesson-id={lesson.id} className="relative">
      <div
        role="treeitem"
        aria-selected={isActive}
        className={`group/lesson flex items-center gap-1.5 rounded px-1.5 py-1 text-sm ${
          isActive
            ? 'bg-emerald-50 font-medium text-emerald-900'
            : 'text-slate-700 focus-within:bg-slate-200/60 hover:bg-slate-200/60'
        }`}
      >
        <span
          ref={handleRef}
          className="flex h-4 w-4 flex-shrink-0 cursor-grab items-center justify-center text-slate-400 hover:text-slate-600 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${
            isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {index + 1}
        </span>
        <Link
          href={`/courses/${courseSlug}/edit/lessons/${lesson.id}`}
          title={lesson.title || 'Untitled Lesson'}
          aria-current={isActive ? 'page' : undefined}
          className="line-clamp-2 flex-1 break-words leading-snug hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          {lesson.title || 'Untitled Lesson'}
        </Link>
        {/* Delete button */}
        <button
          type="button"
          onClick={handleDeleteLesson}
          aria-label="Delete lesson"
          disabled={deleting}
          className={`flex size-5 items-center justify-center rounded text-red-500 transition-opacity opacity-0 group-hover/lesson:opacity-100 hover:bg-red-50 focus-visible:opacity-100 ${
            deleting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {closestEdge && <DropIndicator edge={closestEdge} gap="2px" />}

      {showDeleteModal && (
        <Modal
          title="Delete Lesson"
          size="sm"
          blurStrength="lg"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900">Are you sure?</h3>
                <p className="mt-1 text-sm text-slate-600">This will permanently delete the lesson.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <Button type="outline" size="small" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button type="danger" size="small" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </li>
  );
}

export const LessonRow = memo(LessonRowComponent);
