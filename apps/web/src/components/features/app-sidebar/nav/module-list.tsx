import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';

import { useReorderLessons, useReorderLessonsAcrossModules } from '@/lib/client/hooks/use-courses';

import { DragContext } from './drag-context';
import { ModuleRow } from './module-row';
import { AddModuleButton } from './ui';
import type { Module, Lesson } from './types';

// ---------------------- Types ------------------------------
interface ModuleListProps {
  modules: Module[];
  courseSlug: string;
  courseId: string;
}

type ClosestEdge = 'top' | 'bottom';

export interface LessonDragData {
  lessonId: string;
  moduleId: string;
  index: number;
  instanceId: symbol;
}

// ------------------ Main List -----------------------------
export function ModuleList({ modules: propsModules, courseSlug, courseId }: ModuleListProps) {
  // Use local state for immediate UI updates - this fixes the core issue
  const [localModules, setLocalModules] = useState<Module[]>(propsModules);

  // Sync with props when they change (React Query updates)
  useEffect(() => {
    setLocalModules(propsModules);
  }, [propsModules]);

  // Auto-scroll setup
  useEffect(() => {
    const scrollEl = document.querySelector(
      'nav[aria-label="Course sidebar"] .grow.overflow-auto',
    ) as HTMLElement | null;
    if (!scrollEl) return;
    return autoScrollForElements({ element: scrollEl });
  }, []);

  // Mutations to persist results
  const { mutate: persistWithin } = useReorderLessons();
  const { mutate: persistAcross } = useReorderLessonsAcrossModules();

  // Registry for flash effects
  const registry = useMemo(() => new Map<string, HTMLElement>(), []);

  const registerItem = useCallback(
    ({ lessonId, element }: { lessonId: string; element: HTMLElement }) => {
      registry.set(lessonId, element);
      return () => registry.delete(lessonId);
    },
    [registry],
  );

  const reorderItem = useCallback(
    ({
      sourceModuleId,
      startIndex,
      targetModuleId,
      indexOfTarget,
      closestEdgeOfTarget,
    }: {
      sourceModuleId: string;
      startIndex: number;
      targetModuleId: string;
      indexOfTarget: number;
      closestEdgeOfTarget: ClosestEdge | null;
    }) => {
      // Build lesson lookup from current local state
      const currentLookup: Record<string, Lesson> = Object.fromEntries(
        localModules.flatMap(m => m.lessons.map(l => [l.id, l] as const)),
      );

      if (sourceModuleId === targetModuleId) {
        // Reorder within same module
        const moduleIdx = localModules.findIndex(m => m.id === sourceModuleId);
        if (moduleIdx === -1) return;

        const currentModule = localModules[moduleIdx]!;
        const lessonIds = currentModule.lessons.map(l => l.id);

        const destinationIndex = getReorderDestinationIndex({
          listLength: lessonIds.length,
          closestEdgeOfTarget,
          indexOfTarget,
        });

        const reorderedIds = reorder({
          list: lessonIds,
          startIndex,
          finishIndex: destinationIndex,
        });

        // Update local state immediately for UI
        setLocalModules(prev =>
          prev.map((m, idx) =>
            idx === moduleIdx ? { ...m, lessons: reorderedIds.map(id => currentLookup[id]!) } : m,
          ),
        );

        // Flash the moved item
        const movedLessonId = lessonIds[startIndex]!;
        const movedEl = registry.get(movedLessonId);
        if (movedEl) {
          triggerPostMoveFlash(movedEl);
        }

        // Persist to server
        persistWithin({ courseId, moduleId: sourceModuleId, orderedIds: reorderedIds });
      } else {
        // Move between modules
        const sourceIdx = localModules.findIndex(m => m.id === sourceModuleId);
        const targetIdx = localModules.findIndex(m => m.id === targetModuleId);
        if (sourceIdx === -1 || targetIdx === -1) return;

        const sourceModule = localModules[sourceIdx]!;
        const targetModule = localModules[targetIdx]!;

        const sourceIds = sourceModule.lessons.map(l => l.id);
        const targetIds = targetModule.lessons.map(l => l.id);

        const movedLessonId = sourceIds[startIndex]!;
        const newSourceIds = sourceIds.filter(id => id !== movedLessonId);

        const destIdx = getReorderDestinationIndex({
          listLength: targetIds.length,
          closestEdgeOfTarget,
          indexOfTarget,
        });

        const newTargetIds = [...targetIds];
        newTargetIds.splice(destIdx, 0, movedLessonId);

        // Update local state immediately
        setLocalModules(prev =>
          prev.map((m, idx) => {
            if (idx === sourceIdx) {
              return { ...m, lessons: newSourceIds.map(id => currentLookup[id]!) };
            }
            if (idx === targetIdx) {
              return { ...m, lessons: newTargetIds.map(id => currentLookup[id]!) };
            }
            return m;
          }),
        );

        // Flash the moved item
        const movedEl = registry.get(movedLessonId);
        if (movedEl) {
          triggerPostMoveFlash(movedEl);
        }

        // Build payload for server
        const payload = localModules.map(m => {
          if (m.id === sourceModuleId) {
            return { moduleId: m.id, lessonIds: newSourceIds };
          }
          if (m.id === targetModuleId) {
            return { moduleId: m.id, lessonIds: newTargetIds };
          }
          return { moduleId: m.id, lessonIds: m.lessons.map(l => l.id) };
        });

        // Persist to server
        persistAcross({ courseId, modules: payload });
      }
    },
    [localModules, courseId, persistWithin, persistAcross, registry],
  );

  const instanceId = useMemo(() => Symbol('module-list'), []);
  const ctxValue = useMemo(
    () => ({
      registerItem,
      reorderItem,
      instanceId,
    }),
    [registerItem, reorderItem, instanceId],
  );

  return (
    <DragContext.Provider value={ctxValue}>
      <ul role="tree" aria-label="Course modules" className="flex select-none flex-col gap-2">
        {localModules.map((module, idx) => (
          <ModuleRow
            key={module.id}
            module={module}
            courseSlug={courseSlug}
            defaultOpen={idx === 0}
          />
        ))}
        <li className="mt-3">
          <AddModuleButton courseSlug={courseSlug} />
        </li>
      </ul>
    </DragContext.Provider>
  );
}
