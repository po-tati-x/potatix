import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GripVertical } from 'lucide-react';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import {
  draggable,
  dropTargetForElements,
  type ElementDropTargetEventBasePayload,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

import { useDragCtx } from './drag-context';
import type { Lesson } from './types';

type ClosestEdge = 'top' | 'bottom';

interface LessonRowProps {
  lesson: Lesson;
  index: number;
  moduleId: string;
  courseSlug: string;
}

function LessonRowComponent({ lesson, index, moduleId, courseSlug }: LessonRowProps) {
  const pathname = usePathname();
  const isActive = pathname?.includes(`/lessons/${lesson.id}`);
  const { instanceId, registerItem, reorderItem } = useDragCtx();

  const containerRef = useRef<HTMLLIElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const [closestEdge, setClosestEdge] = useState<ClosestEdge | null>(null);

  const handleChange = useCallback(({ source, self }: ElementDropTargetEventBasePayload) => {
    const handle = handleRef.current;
    if (!handle) return;

    const isSource = source.element === handle;
    if (isSource) {
      setClosestEdge(null);
      return;
    }
    const edge = extractClosestEdge(self.data);
    setClosestEdge(edge);
  }, []);

  const handleDragLeave = useCallback(() => {
    setClosestEdge(null);
  }, []);

  const handleDrop = useCallback(
    (payload: any) => {
      setClosestEdge(null);
      const { source, self } = payload;
      const closestEdgeOfTarget = extractClosestEdge(self.data);
      const src = source.data as { lessonId: string; moduleId: string; index: number };
      reorderItem({
        sourceModuleId: src.moduleId,
        startIndex: src.index,
        targetModuleId: moduleId,
        indexOfTarget: index,
        closestEdgeOfTarget,
      });
    },
    [reorderItem, moduleId, index],
  );

  useEffect(() => {
    const element = containerRef.current;
    const handle = handleRef.current;
    if (!element || !handle) return;

    const cleanup = [
      registerItem({ lessonId: lesson.id, element }),
      draggable({
        element: handle,
        getInitialData: () => ({ lessonId: lesson.id, moduleId, index, instanceId }),
        onGenerateDragPreview({ location, nativeSetDragImage, source }) {
          const rowElement = containerRef.current?.querySelector('div') as HTMLElement | null;
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
              container.appendChild(clone);
              return () => {
                container.removeChild(clone);
              };
            },
          });
        },
      }),
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
      }),
    ];

    return () => {
      cleanup.forEach(fn => fn());
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
        className={`group flex items-center gap-1.5 rounded px-1.5 py-1 text-sm ${
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
      </div>
      {closestEdge && <DropIndicator edge={closestEdge as any} gap="2px" />}
    </li>
  );
}

export const LessonRow = memo(LessonRowComponent);
