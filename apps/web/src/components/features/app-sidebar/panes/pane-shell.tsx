'use client';

import type { ReactNode } from 'react';

interface PaneShellProps {
  /** Content that stays sticky at the top (e.g. sidebar header, cover image) */
  header: ReactNode;
  /** Main scrollable content */
  children: ReactNode;
  /** Optional footer that should stay fixed to the bottom (outside the scroll area) */
  footer?: ReactNode;
  /** Extra className for root */
  className?: string;
}

export function PaneShell({ header, children, footer, className }: PaneShellProps) {
  return (
    <div className={`flex h-full flex-col ${className ?? ''}`.trim()}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex flex-col gap-4 bg-neutral-100 pb-2 after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-black/10">
        {header}
      </div>

      {/* Scrollable body */}
      <div className="grow overflow-y-auto scrollbar-hide">
        {children}
      </div>

      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
} 