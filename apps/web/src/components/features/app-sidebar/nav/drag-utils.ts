import type { CollisionDetection } from '@dnd-kit/core';
import { pointerWithin, rectIntersection, closestCenter } from '@dnd-kit/core';

export interface ModuleRect {
  id: string;
  top: number;
  bottom: number;
}

/**
 * Compute the bounding rectangles for every sidebar module element currently rendered.
 * Relies on the `[data-module-id]` attribute that `ModuleNode` sets on its `<li>` wrapper.
 */
export function computeModuleRects(): ModuleRect[] {
  return [...document.querySelectorAll<HTMLElement>("[data-module-id]")].map((el) => {
    const { top, bottom } = el.getBoundingClientRect();
    const id = el.dataset.moduleId;
    if (!id) throw new Error("Sidebar module element missing data-module-id attr");
    return { id: id, top, bottom };
  });
}

/**
 * Given an array of ModuleRect (usually cached during drag) and a Y coordinate,
 * return the id of the module currently under that point, or null if none.
 */
export function findModuleAtY(rects: ModuleRect[], y: number): string | undefined {
  for (const rect of rects) {
    if (y >= rect.top && y <= rect.bottom) return rect.id;
  }
  return undefined;
}

/**
 * Given a module <li> element and a Y coordinate, return the index at which a dragged lesson
 * should be inserted. We look at every existing lesson item inside the module (they carry
 * a `[data-lesson-id]` attribute) and pick the first one whose vertical midpoint is below
 * the pointer. Fallback is to append to the end.
 */
export function computeInsertIndex(moduleEl: HTMLElement, pointerY: number): number {
  const lessonEls = [...moduleEl.querySelectorAll<HTMLElement>("[data-lesson-id]")];
  for (const [i, lessonEl] of lessonEls.entries()) {
    const rect = lessonEl.getBoundingClientRect();
    if (pointerY < rect.top + rect.height / 2) return i;
  }
  return lessonEls.length; // append if nothing matched
}

/**
 * A collision detection strategy tuned for multi-container sortable lists.
 * 1. Prefer droppables that the pointer is actually inside (`pointerWithin`).
 * 2. Fallback to bounding-box intersection (`rectIntersection`).
 * 3. Finally fallback to centre-point distance (`closestCenter`).
 *
 * This yields much more intuitive feedback when dragging lessons between
 * modules, especially in long lists where `closestCenter` alone tends to
 * highlight containers far away from the pointer.
 */
export const moduleCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;

  const rectHits = rectIntersection(args);
  if (rectHits.length > 0) return rectHits;

  return closestCenter(args);
};