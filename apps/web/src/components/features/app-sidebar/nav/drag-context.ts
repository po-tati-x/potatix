import { createContext, useContext } from 'react';

export interface DragCtx {
  registerItem: (entry: { lessonId: string; element: HTMLElement }) => () => void;
  reorderItem: (args: {
    sourceModuleId: string;
    startIndex: number;
    targetModuleId: string;
    indexOfTarget: number;
    closestEdgeOfTarget: 'top' | 'bottom' | null;
  }) => void;
  instanceId: symbol;
}

export const DragContext = createContext<DragCtx | null>(null);

export function useDragCtx() {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('Drag context missing');
  return ctx;
} 