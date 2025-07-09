import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Pencil, PlusCircle } from 'lucide-react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { useDragCtx } from './drag-context';
import { LessonRow } from './lesson-row';
import { IconButton } from './ui';
import type { Module } from './types';

interface ModuleRowProps {
  module: Module;
  courseSlug: string;
  defaultOpen?: boolean;
}

function ModuleRowComponent({ module, courseSlug, defaultOpen = false }: ModuleRowProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isDragOver, setIsDragOver] = useState(false);

  const { instanceId, reorderItem } = useDragCtx();
  const containerRef = useRef<HTMLLIElement>(null);

  const handleDragEnter = useCallback(() => {
    setIsOpen(true);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    ({ source }: any) => {
      const src = source.data as { lessonId: string; moduleId: string; index: number };
      const startIndex = src.index;
      reorderItem({
        sourceModuleId: src.moduleId,
        startIndex,
        targetModuleId: module.id,
        indexOfTarget: module.lessons.length ? module.lessons.length - 1 : 0,
        closestEdgeOfTarget: 'bottom',
      });
      setIsDragOver(false);
    },
    [reorderItem, module.id, module.lessons.length],
  );

  const handleToggle = useCallback((e: any) => {
    setIsOpen(e.currentTarget.open);
  }, []);

  const handleEditModule = useCallback(() => {
    window.location.href = `/courses/${courseSlug}/edit?module=${module.id}`;
  }, [courseSlug, module.id]);

  const handleAddLesson = useCallback(() => {
    window.location.href = `/courses/${courseSlug}/edit?module=${module.id}&addLesson=1`;
  }, [courseSlug, module.id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop({ source }) {
        return source.data.instanceId === instanceId;
      },
      getData() {
        return { type: 'module', moduleId: module.id };
      },
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    });
  }, [instanceId, module.id, handleDragEnter, handleDragLeave, handleDrop]);

  return (
    <li
      ref={containerRef}
      data-module-id={module.id}
      className={`rounded-md transition-colors ${isDragOver ? 'bg-emerald-50/20 ring-2 ring-emerald-400' : ''}`}
    >
      <details open={isOpen} onToggle={handleToggle} className="group rounded-md">
        <summary className="flex cursor-pointer items-center gap-1 px-1.5 py-1.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-600">
          <span className="chevron flex size-6 items-center justify-center text-slate-500 transition-transform duration-200 group-open:rotate-90">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
          <span
            title={module.title || 'Untitled Module'}
            className="line-clamp-2 flex-1 break-words text-sm font-semibold leading-snug text-slate-800"
          >
            {module.title || 'Untitled Module'}
          </span>
          <div className="flex gap-0.5">
            <IconButton icon={Pencil} label="Edit module" onClick={handleEditModule} />
            <IconButton icon={PlusCircle} label="Add lesson" onClick={handleAddLesson} />
          </div>
        </summary>
        <ul className="ml-2 mt-2 flex flex-col gap-0.5">
          {module.lessons.map((lesson, idx) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={idx}
              moduleId={module.id}
              courseSlug={courseSlug}
            />
          ))}
        </ul>
      </details>
    </li>
  );
}

export const ModuleRow = memo(ModuleRowComponent);
