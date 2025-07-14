import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Pencil, PlusCircle, Check, X, Loader2 } from 'lucide-react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useUpdateModule } from '@/lib/client/hooks/use-courses';
import { useCreateLesson } from '@/lib/client/hooks/use-courses';

import { useDragCtx } from './drag-context';
import { LessonRow } from './lesson-row';
import { IconButton } from './ui';
import type { Module } from './types';

/* ------------------------------------------------------------------ */
/*  Drag-and-drop helper types                                         */
/* ------------------------------------------------------------------ */

interface DragSourceData {
  lessonId: string;
  moduleId: string;
  index: number;
  instanceId: symbol;
}

interface ModuleRowProps {
  module: Module;
  courseSlug: string;
  courseId: string;
  defaultOpen?: boolean;
  onTitleUpdate?: (moduleId: string, newTitle: string) => void;
}

function ModuleRowComponent({ module, courseSlug, courseId, defaultOpen = false, onTitleUpdate }: ModuleRowProps) {
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
    (event: unknown) => {
      const { source } = event as { source: { data: DragSourceData } };
      const { moduleId: srcModuleId, index: startIndex } = source.data;
      reorderItem({
        sourceModuleId: srcModuleId,
        startIndex,
        targetModuleId: module.id,
        indexOfTarget: module.lessons.length > 0 ? module.lessons.length - 1 : 0,
        closestEdgeOfTarget: 'bottom',
      });
      setIsDragOver(false);
    },
    [reorderItem, module.id, module.lessons.length],
  );

  const handleToggle = useCallback((e: React.SyntheticEvent<HTMLDetailsElement>) => {
    setIsOpen(e.currentTarget.open);
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Edit state                                                        */
  /* ------------------------------------------------------------------ */

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title || '');

  const { mutate: updateModule } = useUpdateModule();
  const { mutate: createLesson, isPending: isAddingLesson } = useCreateLesson();

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setEditTitle(module.title || '');
  }, [module.title]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditTitle(module.title || '');
  }, [module.title]);

  const handleEditSubmit = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed.length === 0) return;

    // Inform parent list for global sync
    onTitleUpdate?.(module.id, trimmed);
    setIsEditing(false);

    updateModule({ moduleId: module.id, title: trimmed, courseId });
  }, [editTitle, updateModule, module.id, courseId, onTitleUpdate]);

  const handleAddLesson = useCallback(() => {
    if (isAddingLesson) return;

    // create lesson on server
    createLesson(
      { moduleId: module.id, title: 'New Lesson', courseId },
      {
        onSuccess: () => {
          // open module so user sees new lesson
          setIsOpen(true);
        },
      },
    );
  }, [isAddingLesson, createLesson, module.id, courseId]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      return dropTargetForElements({
        element: el,
        canDrop(event: unknown) {
          const { source } = event as { source: { data: { instanceId?: symbol } } };
          return source.data.instanceId === instanceId;
        },
        getData(): { type: 'module'; moduleId: string } {
          return { type: 'module', moduleId: module.id };
        },
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      });
    }
    // No cleanup necessary when element missing – returning void satisfies Effect typing
  }, [instanceId, module.id, handleDragEnter, handleDragLeave, handleDrop]);

  return (
    <li
      ref={containerRef}
      data-module-id={module.id}
      className={`rounded-md transition-colors ${isDragOver ? 'bg-emerald-50/20 ring-2 ring-emerald-400' : ''}`}
    >
      <details open={isOpen} onToggle={handleToggle} className="group rounded-md">
        <summary className="flex cursor-pointer items-center gap-1 px-1.5 py-1.5 rounded-md hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-600">
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
          {isEditing ? (
            <>
              <textarea
                ref={el => {
                  if (el) {
                    // auto-resize on mount
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
                rows={1}
                value={editTitle}
                onChange={e => {
                  setEditTitle(e.target.value);
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSubmit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleEditCancel();
                  }
                }}
                className="flex min-h-[28px] flex-1 min-w-0 resize-none rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={handleEditSubmit}
                className="flex size-6 items-center justify-center rounded text-emerald-600 hover:bg-emerald-100"
                aria-label="Save module title"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleEditCancel}
                className="flex size-6 items-center justify-center rounded text-slate-600 hover:bg-slate-200"
                aria-label="Cancel editing"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <span
                title={module.title || 'Untitled Module'}
                className="line-clamp-2 flex-1 break-words text-sm font-semibold leading-snug text-slate-800"
              >
                {module.title || 'Untitled Module'}
              </span>
              <div
                className={`flex gap-0.5 transition-opacity ${
                  isAddingLesson || isEditing
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <IconButton icon={Pencil} label="Edit module" onClick={handleEditClick} />
                <IconButton
                  icon={isAddingLesson ? Loader2 : PlusCircle}
                  label="Add lesson"
                  onClick={handleAddLesson}
                />
              </div>
            </>
          )}
        </summary>
        <ul className="ml-2 mt-2 flex flex-col gap-0.5">
          {module.lessons.map((lesson, idx) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={idx}
              moduleId={module.id}
              courseSlug={courseSlug}
              courseId={courseId}
            />
          ))}
        </ul>
      </details>
    </li>
  );
}

export const ModuleRow = memo(ModuleRowComponent);
