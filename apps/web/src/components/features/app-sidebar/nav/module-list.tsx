'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Pencil, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';
import type { ComponentType, MouseEvent } from 'react';
import { useState, useEffect, useMemo, createContext, useContext, useRef } from 'react';
import {
  DndContext,
  rectIntersection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReorderLessons, useReorderLessonsAcrossModules } from '@/lib/client/hooks/use-courses';
import { Button } from '@/components/ui/new-button';
import { GripVertical } from 'lucide-react';

export interface Lesson {
  id: string;
  title: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface ModuleListProps {
  modules: Module[];
  courseSlug: string;
  courseId: string;
}

// Context to share drag-state between modules
interface DragCtx {
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  targetModuleId: string | null;
  setTargetModuleId: (id: string | null) => void;
}
const DragContext = createContext<DragCtx | null>(null);

export function ModuleList({ modules: initialModules, courseSlug, courseId }: ModuleListProps) {
  // Keep local structure: array of {id,title,lessonIds}
  const [modules, setModules] = useState(() =>
    initialModules.map((m) => ({ id: m.id, title: m.title, lessonIds: m.lessons.map((l) => l.id) })),
  );

  // Quick lookup for Lesson objects by id
  const lessonLookup = useMemo(() => {
    const map: Record<string, Lesson> = {};
    initialModules.forEach((mod) => mod.lessons.forEach((l) => (map[l.id] = l)));
    return map;
  }, [initialModules]);

  // Drag state shared
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  // no manual rect math needed with dnd-kit

  // Mutations
  const { mutate: persistWithin } = useReorderLessons();
  const { mutate: persistAcross } = useReorderLessonsAcrossModules();

  // ---- Live sorting helpers ----
  // rely on dnd-kit's built-in arrayMove – no bespoke nonsense

  const dragCtxValue: DragCtx = {
    activeLessonId,
    setActiveLessonId,
    targetModuleId,
    setTargetModuleId,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // RAF-throttled module updates during drag -----------------------------
  type ModulesState = { id: string; title: string; lessonIds: string[] }[];
  const pendingModsRef = useRef<((mods: ModulesState) => ModulesState) | null>(null);
  const rafRef = useRef<number | null>(null);

  function scheduleModulesUpdate(updater: (mods: ModulesState) => ModulesState) {
    pendingModsRef.current = updater;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        setModules((prev) => (pendingModsRef.current ? pendingModsRef.current(prev as ModulesState) : prev));
        pendingModsRef.current = null;
        rafRef.current = null;
      });
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveLessonId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) {
      if (targetModuleId !== null) setTargetModuleId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeModuleId = active.data.current?.moduleId as string;
    const overModuleId = over.data.current?.moduleId as string;

    if (!activeModuleId || !overModuleId) return;

    if (overModuleId !== targetModuleId) setTargetModuleId(overModuleId);

    scheduleModulesUpdate((mods) => {
      // Shallow compare to skip no-op updates -----------------------------
      if (activeModuleId === overModuleId) {
        // Intra-module sort
        const activeMod = mods.find((m) => m.id === activeModuleId);
        if (!activeMod) return mods;
        const oldIdx = activeMod.lessonIds.indexOf(activeId);
        const newIdx = activeMod.lessonIds.indexOf(overId);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return mods;
        return mods.map((m) =>
          m.id === activeModuleId ? { ...m, lessonIds: arrayMove(m.lessonIds, oldIdx, newIdx) } : m,
        );
      }

      // Cross-module move -----------------------------------------------
      let changed = false;
      const next = mods.map((m) => {
        if (m.id === activeModuleId) {
          if (!m.lessonIds.includes(activeId)) return m;
          changed = true;
          return { ...m, lessonIds: m.lessonIds.filter((id) => id !== activeId) };
        }
        if (m.id === overModuleId) {
          const insertIdx = m.lessonIds.indexOf(overId);
          const list = [...m.lessonIds];
          const alreadyAtIndex = list[insertIdx] === activeId;
          if (!alreadyAtIndex) {
            // ensure activeId not present (after removal above it shouldn’t be)
            const idx = list.indexOf(activeId);
            if (idx !== -1) list.splice(idx, 1);
            const pos = insertIdx >= 0 ? insertIdx : list.length;
            list.splice(pos, 0, activeId);
            changed = true;
            return { ...m, lessonIds: list };
          }
        }
        return m;
      });

      return changed ? next : mods;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    // cancel any pending RAF update
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const { active, over } = event;
    setActiveLessonId(null);
    setTargetModuleId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeModuleId = active.data.current?.moduleId as string;
    const overModuleId = over.data.current?.moduleId as string;

    if (!activeModuleId || !overModuleId) return;

    // Intra-module reorder
    if (activeModuleId === overModuleId) {
      if (activeId === overId) return;

      setModules((mods) =>
        mods.map((m) => {
          if (m.id !== activeModuleId) return m;
          const oldIdx = m.lessonIds.indexOf(activeId);
          const newIdx = m.lessonIds.indexOf(overId);
          const newOrder = arrayMove(m.lessonIds, oldIdx, newIdx);
          // persist
          persistWithin({ courseId, moduleId: m.id, orderedIds: newOrder });
          return { ...m, lessonIds: newOrder };
        }),
      );
      return;
    }

    // Cross-module move
    setModules((mods) => {
      let insertIdx: number | null = null;
      const targetMod = mods.find((m) => m.id === overModuleId);
      if (targetMod) {
        const idx = targetMod.lessonIds.indexOf(overId);
        insertIdx = idx >= 0 ? idx : targetMod.lessonIds.length;
      }

      const updated = mods.map((m) => {
        if (m.id === activeModuleId) {
          return { ...m, lessonIds: m.lessonIds.filter((id) => id !== activeId) };
        }
        if (m.id === overModuleId) {
          const list = [...m.lessonIds];
          if (insertIdx !== null) list.splice(insertIdx, 0, activeId);
          else list.push(activeId);
          return { ...m, lessonIds: list };
        }
        return m;
      });

      const payload = updated.map((m) => ({ moduleId: m.id, lessonIds: m.lessonIds }));
      persistAcross({ courseId, modules: payload });
      return updated;
    });
  }

  return (
    <DragContext.Provider value={dragCtxValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ul role="tree" aria-label="Course modules" className="flex flex-col gap-2 select-none">
          {modules.map((module, idx) => (
            <ModuleNode
              key={module.id}
              module={module}
              lessonLookup={lessonLookup}
              courseSlug={courseSlug}
              defaultOpen={idx === 0}
            />
          ))}
          <li className="mt-3">
            <AddModuleButton courseSlug={courseSlug} />
          </li>
        </ul>

        {/* Drag overlay for prettier preview */}
        <DragOverlay dropAnimation={null}>
          {activeLessonId ? (
            <div className="pointer-events-none flex items-center gap-1.5 rounded bg-white px-2 py-1 shadow-md">
              <GripVertical className="size-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-800">
                {activeLessonId ? lessonLookup[activeLessonId!]?.title || 'Untitled Lesson' : ''}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragContext.Provider>
  );
}

interface ModuleNodeProps {
  module: { id: string; title: string; lessonIds: string[] };
  lessonLookup: Record<string, Lesson>;
  courseSlug: string;
  defaultOpen?: boolean;
}

function ModuleNode({ module, lessonLookup, courseSlug, defaultOpen = false }: ModuleNodeProps) {
  const {
    activeLessonId,
    targetModuleId,
  } = useContext(DragContext)!;

  const isDropTarget = Boolean(activeLessonId) && targetModuleId === module.id;

  // Control expansion of <details>
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  // Track if this module was auto-opened because a lesson hovered during drag.
  const autoOpenedRef = useRef(false);

  // Auto-expand when a lesson hovers over this module and collapse when it leaves.
  useEffect(() => {
    // Enter: pointer hovers over this module while dragging → open & mark.
    if (isDropTarget && !isOpen) {
      setIsOpen(true);
      autoOpenedRef.current = true;
    }

    // Exit: pointer leaves this module while dragging → close if we opened it.
    if (!isDropTarget && autoOpenedRef.current && isOpen) {
      setIsOpen(false);
      autoOpenedRef.current = false;
    }
  }, [isDropTarget, isOpen]);

  // Use parent-controlled order directly – no redundant local copy
  const lessonIds = module.lessonIds;

  // Quick lookup map for lesson metadata
  const lessonMap = useMemo(() => {
    const map: Record<string, Lesson> = {};
    lessonIds.forEach((l) => {
      if (lessonLookup[l]) map[l] = lessonLookup[l]!;
    });
    return map;
  }, [lessonIds, lessonLookup]);

  // Intra-module order handled at parent via dnd-kit – no local persistence needed

  const { setNodeRef: setDroppableRef } = useDroppable({ id: module.id, data: { moduleId: module.id, isContainer: true } });

  return (
    <li
      ref={setDroppableRef}
      data-module-id={module.id}
      className={cn(isDropTarget && "ring-2 ring-emerald-400 bg-emerald-50 rounded-md")}
    >
      <details
        open={isOpen}
        onToggle={(e) => {
          const openState = (e.currentTarget as HTMLDetailsElement).open;
          setIsOpen(openState);
          // Any manual toggle by the user resets auto-open tracking.
          if (!openState) autoOpenedRef.current = false;
        }}
        className="group rounded-md"
      >
        <summary
          className={cn(
            "flex cursor-pointer items-center gap-1 px-1.5 py-1.5 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600",
            isDropTarget && "ring-2 ring-emerald-400 bg-emerald-50"
          )}
        >
          <span className="chevron flex size-6 items-center justify-center text-slate-500 transition-transform duration-200 group-open:rotate-90">
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>

          <span
            title={module.title || 'Untitled Module'}
            className="flex-1 break-words text-sm font-semibold leading-snug text-slate-800 line-clamp-2"
          >
            {module.title || 'Untitled Module'}
          </span>

          <div className="flex gap-0.5">
            <IconButton
              icon={Pencil}
              label="Edit module"
              className="size-6"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/courses/${courseSlug}/edit?module=${module.id}`;
              }}
            />
            <IconButton
              icon={PlusCircle}
              label="Add lesson"
              className="size-6"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/courses/${courseSlug}/edit?module=${module.id}&addLesson=1`;
              }}
            />
          </div>
        </summary>

        <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
          <ul className="ml-2 mt-2 flex flex-col gap-0.5">
            {lessonIds.map((id, index) => {
              const lessonObj = lessonMap[id];
              if (!lessonObj) return null;
              return (
                <DraggableLesson
                  key={id}
                  lesson={lessonObj}
                  index={index}
                  courseSlug={courseSlug}
                  moduleId={module.id}
                />
              );
            })}
          </ul>
        </SortableContext>
      </details>
    </li>
  );
}

// Draggable lesson powered by dnd-kit
function DraggableLesson({ lesson, index, courseSlug, moduleId }: { lesson: Lesson; index: number; courseSlug: string; moduleId: string }) {
  // Drag context consumed for potential future use; no-op to avoid ESLint unused-var warning
  useContext(DragContext);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id, data: { moduleId } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-lesson-id={lesson.id}
      // highlight handled via dragStart
      className="relative"
    >
      <LessonNode
        lesson={lesson}
        index={index}
        courseSlug={courseSlug}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </li>
  );
}

// Adjust LessonNode props
interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  courseSlug: string;
  dragListeners: any;
  dragAttributes: any;
}

function LessonNode({ lesson, index, courseSlug, dragListeners, dragAttributes }: LessonNodeProps) {
  const pathname = usePathname();
  const isActive = pathname?.includes(`/lessons/${lesson.id}`);

  return (
    <div
      role="treeitem"
      {...dragAttributes}
      className={`group flex items-center gap-1.5 rounded px-1.5 py-1 text-sm ${isActive ? 'bg-emerald-50 font-medium text-emerald-900' : 'text-slate-700 hover:bg-slate-200/60 focus-within:bg-slate-200/60'}`}
    >
      {/* Drag handle */}
      <span
        className="flex-shrink-0 flex h-4 w-4 items-center justify-center text-slate-400 cursor-grab hover:text-slate-600 active:cursor-grabbing"
        {...dragListeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </span>

      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
          isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
        )}
      >
        {index + 1}
      </span>

      <Link
        href={`/courses/${courseSlug}/edit/lessons/${lesson.id}`}
        title={lesson.title || 'Untitled Lesson'}
        aria-current={isActive ? 'page' : undefined}
        className="flex-1 break-words leading-snug hover:underline line-clamp-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        {lesson.title || 'Untitled Lesson'}
      </Link>
    </div>
  );
}

// Reusable small icon button
function IconButton({ icon: Icon, onClick, label, className = '' }: { icon: ComponentType<{ className?: string }>; onClick: (e: MouseEvent<HTMLButtonElement>) => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600", className)}
      aria-label={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function AddModuleButton({ courseSlug }: { courseSlug: string }) {
  function handleClick() {
    if (courseSlug) {
      window.location.href = `/courses/${courseSlug}/edit?addModule=1`;
    }
  }

  return (
    <Button
      type="outline"
      size="small"
      block
      iconLeft={<PlusCircle />}
      className="justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50"
      aria-label="Add module"
      onClick={handleClick}
    >
      Add module
    </Button>
  );
}

// Removed unused AddLessonButton component to satisfy ESLint 